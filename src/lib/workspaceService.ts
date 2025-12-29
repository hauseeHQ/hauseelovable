import { supabase } from './supabaseClient';

export async function ensureUserWorkspace(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError && memberError.code !== 'PGRST116') {
      throw memberError;
    }

    if (member) {
      return member.workspace_id;
    }

    const workspaceName = `${user.email}'s Workspace`;

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: workspaceName,
        created_by: user.id,
      })
      .select()
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    const { error: memberInsertError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberInsertError) {
      throw memberInsertError;
    }

    return workspace.id;
  } catch (err: any) {
    console.error('Error ensuring workspace:', err);
    return null;
  }
}
