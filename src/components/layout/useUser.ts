import { useSSO } from "@/components/TaskApp";

export const useUser = () => {
  const { user } = useSSO();
  return user;
};