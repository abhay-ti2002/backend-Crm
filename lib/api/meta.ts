import { api } from "./api";

export interface AgentLevel {
    id: string;
    value: number;
    label: string;
    description: string;
}

export interface AgentConfig {
    sectors: string[];
    levels: AgentLevel[];
}

export const getAgentConfig = async (): Promise<AgentConfig> => {
    return api("/meta/agent-config");
};
