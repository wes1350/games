import { WebUtils } from "utils/WebUtils";

export class BackendGateway {
    private static url = "http://localhost:3001/";
    public static GetCurrentRooms(): Promise<any> {
        return WebUtils.GET(BackendGateway.url + "rooms")
            .then((res) => {
                if (res.rooms) {
                    return res.rooms;
                }
                return null;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    public static CreateRoom(): Promise<string> {
        return WebUtils.POST(BackendGateway.url + "createRoom", undefined);
    }

    public static GetName(): Promise<string> {
        return WebUtils.GET(BackendGateway.url + "getName").then((res) => {
            return res.name;
        });
    }

    public static SetName(name: string): Promise<boolean> {
        return WebUtils.POST(BackendGateway.url + "setName", { name: name });
    }
}
