import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
import { clientSvc, Context } from "#services";

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetClientData(
  enabled = true,
  shouldInvalidate = false
) {
  const queryClient = useQueryClient();
  const oldData = queryClient.getQueryData({ queryKey: ["client-data"] });
  const [clientData, setClientData] = useState(oldData || null);
  const [oldDataCopy, setOldDataCopy] = useState(oldData || null);

  const { token } = useContext(Context);

  useEffect(() => {
    if (shouldInvalidate) {
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
    }
  }, [shouldInvalidate]);

  const fetchClientData = async () => {
    const res = await clientSvc.getClientData();

    const data = {
      clientID: res.data.client_detail_id,
      accessToken: res.data.access_token,
      email: res.data.email || "",
      name: res.data.name || "",
      surname: res.data.surname || "",
      nickname: res.data.nickname || "",
      sex: res.data.sex || "",
      yearOfBirth: res.data.year_of_birth || "",
      image: res.data.image,
      urbanRural: res.data.urban_rural || "",
      dataProcessing: res.data.data_processing,
      pushNotificationTokens: res.data.push_notification_tokens,
    };

    return data;
  };

  const clientDataQuery = useQuery(["client-data"], fetchClientData, {
    enabled: enabled && !!token,
    onSuccess: (data) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      setOldDataCopy(dataCopy);
      setClientData({ ...dataCopy });
    },
    staleTime: Infinity,
  });

  const update = (data) => {
    queryClient.setQueryData(["client-data"], data);
    setClientData(data);
  };
  return [clientDataQuery, clientData, oldDataCopy, update];
}

export { useGetClientData };
