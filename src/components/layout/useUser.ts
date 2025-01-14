import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import UserService from "@/services/UserService";
import { User } from "@/interfaces/UserInterface";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);  // Tipando o estado corretamente
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const user: User = await UserService.getUserById(userId);  // Supondo que a função retorne um User
          setUser(user);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do usuário.",
        });
        setUser(null);  // Definindo como null se houver erro
      }
    };

    getUser();
  }, [toast]);

  return user;
};
