export class WebUtils {
    public static GET(url: string): Promise<any> {
        return WebUtils.Request("GET", url);
    }

    public static POST(url: string, body: any): Promise<any> {
        return WebUtils.Request("POST", url, body, {
            "Content-Type": "application/json"
        });
    }

    private static Request(
        method: "GET" | "POST",
        url: string,
        body?: any,
        headers?: any
    ): Promise<any> {
        return fetch(url, {
            method,
            body: JSON.stringify(body),
            mode: "cors",
            credentials: "include",
            headers
        })
            .then((res) => {
                return res.json();
            })
            .catch((err) => {
                console.error(err.message);
                return { error: err.message };
            });
    }
}
