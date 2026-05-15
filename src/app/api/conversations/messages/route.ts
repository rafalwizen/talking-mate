import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, role, content } = body as {
      conversationId: string;
      role: string;
      content: string;
    };

    if (!conversationId || !role || !content) {
      return Response.json(
        { error: 'Missing required fields: conversationId, role, content' },
        { status: 400 },
      );
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();

    if (error) {
      console.error('Failed to save message:', error);
      return Response.json(
        { error: 'Failed to save message' },
        { status: 500 },
      );
    }

    return Response.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Message POST error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
