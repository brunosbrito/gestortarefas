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
        const userId = localStorage.getItem("userId");

        // Se não houver token OU userId, limpar tudo e redirecionar
        if (!token || !userId) {
          // Limpar storage completamente
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');

          // Redirecionar para login
          window.location.href = '/';
          return;
        }

        // Buscar dados do usuário
        const user: User = await UserService.getUserById(userId);
        setUser(user);
      } catch (error: any) {
        console.error("Erro ao buscar usuário:", error);

        // Se for erro 401 (não autorizado), limpar token e redirecionar para login
        if (error?.response?.status === 401) {
          // Limpar TODOS os tokens possíveis (authToken é o correto)
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('token'); // Legacy, caso exista
          localStorage.removeItem('userId');

          // Usar window.location para forçar reload completo e limpar estado
          window.location.href = '/';
          return;
        }

        // Outros erros: mostrar toast e limpar user
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