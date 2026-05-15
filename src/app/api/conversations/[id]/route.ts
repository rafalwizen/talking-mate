import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the conversation and verify ownership
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    // Fetch messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Failed to fetch messages:', msgError);
      return Response.json(
        { error: 'Failed to fetch messages' },
        { status: 500 },
      );
    }

    return Response.json({ conversation, messages });
  } catch (error) {
    console.error('Conversation GET error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    // Delete the conversation (messages are cascade-deleted via FK)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete conversation:', deleteError);
      return Response.json(
        { error: 'Failed to delete conversation' },
        { status: 500 },
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Conversation DELETE error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
