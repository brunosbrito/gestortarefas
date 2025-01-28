import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import UserService from "@/services/UserService";
import { User } from "@/interfaces/UserInterface";
import { getStoredToken } from "@/services/AuthService";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          setUser(null);
          return;
        }

        const userId = localStorage.getItem("userId");
        if (userId) {
          const user: User = await UserService.getUserById(userId);
          setUser(user);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do usuário.",
        });
        setUser(null);
      }
    };

    getUser();
  }, [toast]);

  return user;
};