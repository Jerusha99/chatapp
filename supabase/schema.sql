-- ============================================================
-- Chat Bruce - Supabase Database Schema
-- WhatsApp-class chat application
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE chat_type AS ENUM ('direct', 'group');

CREATE TYPE member_role AS ENUM ('admin', 'member');

CREATE TYPE message_type AS ENUM (
    'text',
    'image',
    'video',
    'voice',
    'document',
    'location',
    'contact',
    'system'
);

CREATE TYPE delivery_status AS ENUM ('sent', 'delivered', 'read');

CREATE TYPE status_type AS ENUM ('text', 'image', 'video');

CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Users
CREATE TABLE public.users (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone       text UNIQUE,
    email       text UNIQUE,
    display_name text,
    avatar_url  text,
    bio         text DEFAULT '',
    is_online   boolean DEFAULT false,
    last_seen_at timestamptz,
    is_admin    boolean DEFAULT false,
    is_banned   boolean DEFAULT false,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- 2. Contacts
CREATE TABLE public.contacts (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contact_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at  timestamptz DEFAULT now(),
    UNIQUE (owner_id, contact_id)
);

-- 3. Chats
CREATE TABLE public.chats (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type        chat_type NOT NULL DEFAULT 'direct',
    name        text,
    description text,
    avatar_url  text,
    created_by  uuid REFERENCES public.users(id) ON DELETE SET NULL,
    is_archived boolean DEFAULT false,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- 4. Chat Members
CREATE TABLE public.chat_members (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id               uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id               uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role                  member_role DEFAULT 'member',
    joined_at             timestamptz DEFAULT now(),
    last_read_at          timestamptz,
    is_muted              boolean DEFAULT false,
    notifications_disabled boolean DEFAULT false,
    UNIQUE (chat_id, user_id)
);

-- 5. Messages
CREATE TABLE public.messages (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id     uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,
    type        message_type DEFAULT 'text',
    content     text,
    media_url   text,
    reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
    edited_at   timestamptz,
    deleted_for uuid[] DEFAULT '{}',
    created_at  timestamptz DEFAULT now()
);

-- 6. Message Status (delivery receipts)
CREATE TABLE public.message_status (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status      delivery_status DEFAULT 'sent',
    created_at  timestamptz DEFAULT now(),
    UNIQUE (message_id, user_id)
);

-- 7. Media
CREATE TABLE public.media (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,
    file_name     text NOT NULL,
    file_type     text NOT NULL,
    file_size     bigint NOT NULL,
    url           text NOT NULL,
    thumbnail_url text,
    created_at    timestamptz DEFAULT now()
);

-- 8. Reactions
CREATE TABLE public.reactions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    emoji       text NOT NULL,
    created_at  timestamptz DEFAULT now(),
    UNIQUE (message_id, user_id)
);

-- 9. Statuses (stories)
CREATE TABLE public.statuses (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type        status_type DEFAULT 'text',
    content     text,
    media_url   text,
    expires_at  timestamptz NOT NULL,
    created_at  timestamptz DEFAULT now()
);

-- 10. Blocks
CREATE TABLE public.blocks (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at  timestamptz DEFAULT now(),
    UNIQUE (blocker_id, blocked_id)
);

-- 11. Reports
CREATE TABLE public.reports (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
    reported_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
    reason              text NOT NULL,
    status              report_status DEFAULT 'pending',
    created_at          timestamptz DEFAULT now(),
    resolved_at         timestamptz
);

-- ============================================================
-- HELPER FUNCTIONS (after tables exist)
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Check if a user is a member of a specific chat
CREATE OR REPLACE FUNCTION public.is_chat_member(chat_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_members
        WHERE chat_id = chat_uuid
          AND user_id = user_uuid
    );
$$;

-- Check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = user_uuid
          AND is_admin = true
    );
$$;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, phone, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.phone,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.phone, split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
    );
    RETURN NEW;
END;
$$;

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_phone ON public.users (phone);
CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_is_admin ON public.users (is_admin) WHERE is_admin = true;

-- Contacts
CREATE INDEX idx_contacts_owner_id ON public.contacts (owner_id);
CREATE INDEX idx_contacts_contact_id ON public.contacts (contact_id);

-- Chats
CREATE INDEX idx_chats_type ON public.chats (type);
CREATE INDEX idx_chats_created_by ON public.chats (created_by);

-- Chat Members
CREATE INDEX idx_chat_members_user_id ON public.chat_members (user_id);
CREATE INDEX idx_chat_members_chat_id ON public.chat_members (chat_id);
CREATE INDEX idx_chat_members_chat_user ON public.chat_members (chat_id, user_id);

-- Messages
CREATE INDEX idx_messages_chat_id ON public.messages (chat_id);
CREATE INDEX idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX idx_messages_chat_created ON public.messages (chat_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON public.messages (reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Message Status
CREATE INDEX idx_message_status_message_id ON public.message_status (message_id);
CREATE INDEX idx_message_status_user_id ON public.message_status (user_id);
CREATE INDEX idx_message_status_message_user ON public.message_status (message_id, user_id);

-- Media
CREATE INDEX idx_media_uploader_id ON public.media (uploader_id);

-- Reactions
CREATE INDEX idx_reactions_message_id ON public.reactions (message_id);
CREATE INDEX idx_reactions_user_id ON public.reactions (user_id);

-- Statuses
CREATE INDEX idx_statuses_user_id ON public.statuses (user_id);
CREATE INDEX idx_statuses_expires_at ON public.statuses (expires_at);

-- Blocks
CREATE INDEX idx_blocks_blocker_id ON public.blocks (blocker_id);
CREATE INDEX idx_blocks_blocked_id ON public.blocks (blocked_id);

-- Reports
CREATE INDEX idx_reports_reporter_id ON public.reports (reporter_id);
CREATE INDEX idx_reports_reported_user_id ON public.reports (reported_user_id);
CREATE INDEX idx_reports_status ON public.reports (status);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated_at triggers for users and chats
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: USERS
-- ============================================================

-- Anyone can read user profiles (for contact lookup, display names, etc.)
CREATE POLICY "Users: anyone can view profiles"
    ON public.users
    FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users: can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================
-- RLS POLICIES: CONTACTS
-- ============================================================

-- Users can view their own contacts
CREATE POLICY "Contacts: can view own contacts"
    ON public.contacts
    FOR SELECT
    USING (auth.uid() = owner_id);

-- Users can add contacts for themselves
CREATE POLICY "Contacts: can insert own contacts"
    ON public.contacts
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own contacts
CREATE POLICY "Contacts: can delete own contacts"
    ON public.contacts
    FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================================
-- RLS POLICIES: CHATS
-- ============================================================

-- Users can view chats they are members of, or admins can view all
CREATE POLICY "Chats: members can view"
    ON public.chats
    FOR SELECT
    USING (
        public.is_chat_member(id, auth.uid())
        OR public.is_admin(auth.uid())
    );

-- Any authenticated user can create a chat
CREATE POLICY "Chats: authenticated can create"
    ON public.chats
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Chat admins can update chat details
CREATE POLICY "Chats: admins can update"
    ON public.chats
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = id
              AND user_id = auth.uid()
              AND role = 'admin'
        )
        OR public.is_admin(auth.uid())
    );

-- ============================================================
-- RLS POLICIES: CHAT MEMBERS
-- ============================================================

-- Members can view members of chats they belong to
CREATE POLICY "Chat Members: can view own chat members"
    ON public.chat_members
    FOR SELECT
    USING (
        public.is_chat_member(chat_id, auth.uid())
        OR public.is_admin(auth.uid())
    );

-- Chat admins can add members
CREATE POLICY "Chat Members: chat admins can add"
    ON public.chat_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = chat_members.chat_id
              AND user_id = auth.uid()
              AND role = 'admin'
        )
        OR public.is_admin(auth.uid())
    );

-- Chat admins or the user themselves can update membership
CREATE POLICY "Chat Members: can update membership"
    ON public.chat_members
    FOR UPDATE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
              AND cm.user_id = auth.uid()
              AND cm.role = 'admin'
        )
        OR public.is_admin(auth.uid())
    );

-- Chat admins can remove members
CREATE POLICY "Chat Members: can remove membership"
    ON public.chat_members
    FOR DELETE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
              AND cm.user_id = auth.uid()
              AND cm.role = 'admin'
        )
        OR public.is_admin(auth.uid())
    );

-- ============================================================
-- RLS POLICIES: MESSAGES
-- ============================================================

-- Chat members can read messages in their chats
CREATE POLICY "Messages: members can view"
    ON public.messages
    FOR SELECT
    USING (
        public.is_chat_member(chat_id, auth.uid())
        OR public.is_admin(auth.uid())
    );

-- Chat members can send messages
CREATE POLICY "Messages: members can insert"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        public.is_chat_member(chat_id, auth.uid())
        AND auth.uid() = sender_id
    );

-- Only sender can edit their own message
CREATE POLICY "Messages: sender can update"
    ON public.messages
    FOR UPDATE
    USING (
        auth.uid() = sender_id
    );

-- Hard delete: only admins
CREATE POLICY "Messages: can delete"
    ON public.messages
    FOR DELETE
    USING (
        public.is_admin(auth.uid())
    );

-- ============================================================
-- RLS POLICIES: MESSAGE STATUS
-- ============================================================

-- Members can view message status in their chats
CREATE POLICY "Message Status: members can view"
    ON public.message_status
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_status.message_id
              AND public.is_chat_member(m.chat_id, auth.uid())
        )
        OR public.is_admin(auth.uid())
    );

-- Users can insert status for messages in their chats
CREATE POLICY "Message Status: members can insert"
    ON public.message_status
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_status.message_id
              AND public.is_chat_member(m.chat_id, auth.uid())
        )
    );

-- Users can update their own message status
CREATE POLICY "Message Status: can update own"
    ON public.message_status
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: MEDIA
-- ============================================================

-- Anyone authenticated can view media
CREATE POLICY "Media: authenticated can view"
    ON public.media
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Users can upload media for themselves
CREATE POLICY "Media: can insert own"
    ON public.media
    FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

-- ============================================================
-- RLS POLICIES: REACTIONS
-- ============================================================

-- Chat members can view reactions on messages in their chats
CREATE POLICY "Reactions: members can view"
    ON public.reactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = reactions.message_id
              AND public.is_chat_member(m.chat_id, auth.uid())
        )
        OR public.is_admin(auth.uid())
    );

-- Chat members can add reactions
CREATE POLICY "Reactions: members can insert"
    ON public.reactions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = reactions.message_id
              AND public.is_chat_member(m.chat_id, auth.uid())
        )
    );

-- Users can delete their own reactions
CREATE POLICY "Reactions: can delete own"
    ON public.reactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: STATUSES (Stories)
-- ============================================================

-- Anyone can view non-expired statuses
CREATE POLICY "Statuses: can view active"
    ON public.statuses
    FOR SELECT
    USING (
        expires_at > now()
        OR public.is_admin(auth.uid())
    );

-- Users can create their own statuses
CREATE POLICY "Statuses: can insert own"
    ON public.statuses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own statuses
CREATE POLICY "Statuses: can delete own"
    ON public.statuses
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: BLOCKS
-- ============================================================

-- Users can view their own blocks
CREATE POLICY "Blocks: can view own blocks"
    ON public.blocks
    FOR SELECT
    USING (
        auth.uid() = blocker_id
        OR auth.uid() = blocked_id
    );

-- Users can block someone
CREATE POLICY "Blocks: can insert own"
    ON public.blocks
    FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock someone they blocked
CREATE POLICY "Blocks: can delete own blocks"
    ON public.blocks
    FOR DELETE
    USING (auth.uid() = blocker_id);

-- ============================================================
-- RLS POLICIES: REPORTS
-- ============================================================

-- Users can view their own reports; admins can view all
CREATE POLICY "Reports: can view reports"
    ON public.reports
    FOR SELECT
    USING (
        auth.uid() = reporter_id
        OR public.is_admin(auth.uid())
    );

-- Users can create reports
CREATE POLICY "Reports: can create reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Only admins can update report status
CREATE POLICY "Reports: admins can update"
    ON public.reports
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime on messages, message_status, and chat_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
