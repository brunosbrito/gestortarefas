import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useUserName = () => {
  const [userName, setUserName] = useState("Carregando...");
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('user_ref', user.id)
            .maybeSingle();
          
          if (userError) throw userError;
          
          if (userData?.name) {
            setUserName(userData.name);
          } else {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .maybeSingle();
            
            if (profileError) throw profileError;
            
            if (profile?.name) {
              setUserName(profile.name);
            } else {
              setUserName("Usuário");
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do usuário."
        });
        setUserName("Usuário");
      }
    };

    getUser();
  }, [toast]);

  return userName;
};