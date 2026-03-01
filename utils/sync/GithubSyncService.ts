/**
 * @file utils/sync/GithubSyncService.ts
 * @description Github Gist 同步策略实现
 */
import type { ISyncProvider, SyncDataPayload } from "./index";
import type { GithubSyncConfig } from "@/types";

const GITHUB_API_URL = "https://api.github.com/gists";
const GIST_FILENAME = "promptpark_sync_data.json";

export class GithubSyncService implements ISyncProvider {
  private config: GithubSyncConfig;

  constructor(config: GithubSyncConfig) {
    this.config = config;
  }

  private getAuthHeaders() {
    if (!this.config.token) {
      throw new Error("未配置 Github Token");
    }
    return {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${this.config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  async testConnection(): Promise<boolean> {
    if (!this.config.token) return false;
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async pushData(payload: SyncDataPayload): Promise<string> {
    const headers = this.getAuthHeaders();
    const body = {
      description: "PromptPark Data Sync Backup",
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    };

    let response;
    if (this.config.gistId) {
      response = await fetch(`${GITHUB_API_URL}/${this.config.gistId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      response = await fetch(GITHUB_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Github 同步失败: ${response.status} ${errorMsg}`);
    }

    const data = await response.json();
    return data.id; // 返回 Gist ID，让调用方决定是否要存入设置
  }

  async pullData(): Promise<SyncDataPayload> {
    if (!this.config.gistId) {
      throw new Error("未配置 Gist ID，无法拉取数据");
    }

    const headers = this.getAuthHeaders();
    const response = await fetch(`${GITHUB_API_URL}/${this.config.gistId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Github 拉取失败: ${response.status}`);
    }

    const data = await response.json();
    const fileContent = data.files[GIST_FILENAME]?.content;

    if (!fileContent) {
      throw new Error("云端 Gist 中未找到备份文件");
    }

    return JSON.parse(fileContent) as SyncDataPayload;
  }
}
