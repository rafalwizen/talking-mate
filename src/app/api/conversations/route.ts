import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch conversations:', error);
      return Response.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 },
      );
    }

    return Response.json({ conversations });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

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
    const { language, mode, scenarioId } = body as {
      language: string;
      mode: string;
      scenarioId?: string | null;
    };

    if (!language || !mode) {
      return Response.json(
        { error: 'Missing required fields: language, mode' },
        { status: 400 },
      );
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        language,
        mode,
        scenario_id: scenarioId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      return Response.json(
        { error: 'Failed to create conversation' },
        { status: 500 },
      );
    }

    return Response.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
