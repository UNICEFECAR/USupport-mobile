import { useQuery } from "@tanstack/react-query";
import { userSvc } from "#services";

export default function useGetWorkWithCategories() {
  const fetchWorkWithCateogries = async () => {
    const { data } = await userSvc.getWorkWithCategories();
    return data;
  };
  const query = useQuery(["work-with-categories"], fetchWorkWithCateogries);

  return query;
}

export { useGetWorkWithCategories };
