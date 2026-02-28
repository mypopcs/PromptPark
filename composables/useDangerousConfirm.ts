import { useConfirm } from "@/composables/useConfirm";

/**
 * 危险操作二次确认 Hook。
 * 用途：统一删除等高风险行为的二次确认文案与交互流程。
 */
export function useDangerousConfirm() {
  const { openConfirm } = useConfirm();

  /**
   * 执行二次确认。
   * @param targetName 目标名称，例如“该词典”、“该提示词”。
   * @returns 用户是否完成两次确认。
   */
  const confirmDangerousDelete = async (targetName: string): Promise<boolean> => {
    const firstConfirm = await openConfirm(
      "危险操作确认",
      `确定要删除${targetName}吗？`,
    );

    if (!firstConfirm) {
      return false;
    }

    return openConfirm("再次确认", `删除后将无法恢复，请再次确认删除${targetName}`);
  };

  return {
    confirmDangerousDelete,
  };
}
