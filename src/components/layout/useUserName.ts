import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useUserName = () => {
  const [userName, setUserName] = useState("Carregando...");
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        setUserName("Bruno");
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