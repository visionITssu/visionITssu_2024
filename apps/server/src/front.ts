import { DefaultApi } from "generated-client"

const func = async () => {
    const api = new DefaultApi();
    const res = await api.appControllerGetHello();
    res.data
}