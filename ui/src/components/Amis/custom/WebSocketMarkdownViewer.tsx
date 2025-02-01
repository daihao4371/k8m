import React, {ForwardedRef, useEffect, useRef, useState} from "react";
import {render as amisRender} from "amis";
import {formatFinalGetUrl} from "@/utils/utils";

interface WebSocketMarkdownViewerProps {
    url: string;
    params: Record<string, string>;
    data: Record<string, any>

}

const WebSocketMarkdownViewer = React.forwardRef<HTMLDivElement, WebSocketMarkdownViewerProps>(
    ({url, data, params}, ref: ForwardedRef<HTMLDivElement>) => {
        url = formatFinalGetUrl({url, data, params});

        const [messages, setMessages] = useState<string[]>([]);
        const [status, setStatus] = useState<string>("Disconnected");
        const wsRef = useRef<WebSocket | null>(null);

        useEffect(() => {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => setStatus("Connected");

            ws.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    const rawMessage = parsedData.data || "";
                    if (rawMessage) {
                        setMessages((prev) => [...prev, rawMessage]);
                    }
                } catch (error) {
                    console.error("Failed to parse WebSocket message:", error);
                    setMessages((prev) => [...prev, event.data]);
                }
            };

            ws.onclose = () => setStatus("Disconnected");
            ws.onerror = () => setStatus("Error");

            return () => {
                wsRef.current?.close();
                wsRef.current = null;
            };
        }, [url]);

        const markdownContent = messages.join("");

        return (
            <div ref={ref}>
                <p style={{display: "none"}}>WebSocket Status: {status}</p>
                <div
                    style={{
                        backgroundColor: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "5px",
                        overflowX: "auto",
                    }}
                >
                    {amisRender({
                        type: "markdown",
                        value: markdownContent,
                    })}
                </div>
            </div>
        );
    }
);

export default WebSocketMarkdownViewer;
