import React, { useEffect, useMemo, useRef, useState } from "react";
import { render, Box, Text, useApp, useInput, useStdout } from "ink";
import { StatusMessage } from "@inkjs/ui";
import {
  buildResource,
  generateUniqueGroupId,
  groupExists,
  groupIdExists,
  isValidGroupId,
  isValidUrl,
  renderEntry,
  renderGroup,
  resourceGroups,
  resourcesForGroup,
  typesForGroup,
  urlTaken,
  validateNewGroup,
  writeFlowResult,
  type FlowResult,
  type ResourceGroup,
  type ResourceStatus,
} from "./add-resource-core";

type Step =
  | "group"
  | "new-group-title"
  | "new-group-id-preview"
  | "new-group-id-edit"
  | "new-group-description"
  | "new-group-preview"
  | "type"
  | "name"
  | "url"
  | "use"
  | "status"
  | "preview"
  | "done";

interface TuiOptions {
  dryRun: boolean;
  skipFavicon: boolean;
}

interface FormState {
  group?: ResourceGroup;
  newGroup?: ResourceGroup;
  groupTitle?: string;
  groupId?: string;
  groupDescription?: string;
  type?: string;
  name?: string;
  url?: string;
  use?: string;
  status?: ResourceStatus;
}

interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

type TextField = "groupTitle" | "groupDescription" | "name" | "url" | "use";

const stepOrder: Step[] = [
  "group",
  "type",
  "name",
  "url",
  "use",
  "status",
  "preview",
];

const stepLabels: Record<Step, string> = {
  group: "选择分组",
  "new-group-title": "新分组标题",
  "new-group-id-preview": "确认分组 ID",
  "new-group-id-edit": "编辑分组 ID",
  "new-group-description": "新分组描述",
  "new-group-preview": "确认新分组",
  type: "选择类型",
  name: "资源名字",
  url: "资源链接",
  use: "使用场景",
  status: "状态",
  preview: "预览写入",
  done: "完成",
};

const tuiTheme = {
  muted: "#8a8a8a",
  border: "#c8a96e",
  accent: "#c8a96e",
  accentDim: "#8a7340",
  curated: "#6a7a50",
  pending: "#8a7a58",
  error: "#b5473f",
};

function isEsc(input: string): boolean {
  return input === "\u001B";
}

function previousLinearStep(step: Step, state: FormState): Step {
  if (step === "type" && state.newGroup) return "new-group-preview";
  const index = stepOrder.indexOf(step);
  return stepOrder[Math.max(0, index - 1)];
}

function moveWrapped(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
}

function printableInput(input: string): boolean {
  return input.length > 0 && !/[\u0000-\u001F\u007F]/.test(input);
}

function isClearShortcut(input: string, key: { ctrl: boolean; meta: boolean; super?: boolean }): boolean {
  return input === "\u0018" || input === "\u0015" || (input.toLowerCase() === "x" && (key.ctrl || key.meta || key.super));
}

function charDisplayWidth(char: string): number {
  return /[\u1100-\u115F\u2329\u232A\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/u.test(char)
    ? 2
    : 1;
}

function displayWidth(value: string): number {
  return Array.from(value).reduce((total, char) => total + charDisplayWidth(char), 0);
}

function sliceTailToDisplayWidth(value: string, width: number): string {
  let output = "";
  let used = 0;
  for (const char of Array.from(value).reverse()) {
    const charWidth = charDisplayWidth(char);
    if (used + charWidth > width) break;
    output = char + output;
    used += charWidth;
  }
  return output;
}

function underlineInput(value: string, focused: boolean, blinkOn: boolean, width = 32): string {
  const cursorWidth = focused ? 1 : 0;
  const valueWidth = Math.max(0, width - cursorWidth);
  const visibleValue = displayWidth(value) > valueWidth
    ? sliceTailToDisplayWidth(value, valueWidth)
    : value;
  const cursor = focused ? (blinkOn ? "|" : " ") : "";
  const contentWidth = displayWidth(visibleValue) + cursorWidth;
  return visibleValue + cursor + " ".repeat(Math.max(0, width - contentWidth));
}

function visibleOptions(options: SelectOption[], focusedIndex: number, count = 12): SelectOption[] {
  if (options.length <= count) return options;
  const half = Math.floor(count / 2);
  const start = Math.max(0, Math.min(focusedIndex - half, options.length - count));
  return options.slice(start, start + count);
}

function OptionList({
  blinkOn,
  customInput,
  customInputOptionValue = "__custom_type__",
  customInputWidth = 32,
  focusedIndex,
  options,
}: {
  blinkOn?: boolean;
  customInput?: string;
  customInputOptionValue?: string;
  customInputWidth?: number;
  focusedIndex: number;
  options: SelectOption[];
}) {
  const shown = visibleOptions(options, focusedIndex);
  const offset = options.indexOf(shown[0] ?? options[0]);
  return (
    <Box flexDirection="column">
      {shown.map((option, i) => {
        const index = offset + i;
        const isFocused = index === focusedIndex;
        const prefix = `${String(index + 1).padStart(2, " ")}.`;
        const isCustomInput = option.value === customInputOptionValue && typeof customInput === "string";
        return (
          <Box key={option.value}>
            <Text color={isFocused ? tuiTheme.accent : tuiTheme.muted}>
              {isFocused ? "❯ " : "  "}{prefix}{" "}
            </Text>
            {isCustomInput ? (
              <Text underline color={customInput ? undefined : tuiTheme.muted}>
                {underlineInput(customInput, isFocused, blinkOn ?? true, customInputWidth)}
              </Text>
            ) : (
              <Text color={isFocused ? tuiTheme.accent : undefined}>{option.label}</Text>
            )}
          </Box>
        );
      })}
      {options[focusedIndex]?.description ? (
        <Box marginTop={1} borderStyle="single" borderColor={tuiTheme.accentDim} paddingX={1} flexDirection="column">
          <Text color={tuiTheme.muted}>说明</Text>
          <Text>{options[focusedIndex].description}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

function UnderlinedInput({
  blinkOn,
  value,
  width = 52,
}: {
  blinkOn: boolean;
  value?: string;
  width?: number;
}) {
  return (
    <Text underline>
      {underlineInput(value ?? "", true, blinkOn, width)}
    </Text>
  );
}

function Frame({
  children,
  error,
  help,
  step,
  terminalWidth,
}: {
  children: React.ReactNode;
  error?: string;
  help?: string;
  step: Step;
  terminalWidth: number;
}) {
  const indexedStep: Step = step.startsWith("new-group")
      ? "group"
      : step;
  const displayIndex = Math.max(1, stepOrder.includes(indexedStep) ? stepOrder.indexOf(indexedStep) + 1 : 1);
  const appWidth = Math.max(96, terminalWidth - 2);
  return (
    <Box flexDirection="column" minHeight={24} width={appWidth}>
      <Box borderStyle="round" borderColor={tuiTheme.border} paddingX={2} paddingY={1} width="100%" flexDirection="column">
        <Box>
          <Box width={28} flexDirection="column" marginRight={3}>
            <Text bold>添加资源</Text>
            <Text color={tuiTheme.muted}>resource-library</Text>
            <Box marginTop={1} flexDirection="column">
              {stepOrder.map((item, index) => {
                const active = item === indexedStep;
                return (
                  <Text key={item} color={active ? tuiTheme.accent : tuiTheme.muted}>
                    {active ? "❯ " : "  "}{index + 1}. {stepLabels[item]}
                  </Text>
                );
              })}
            </Box>
          </Box>
          <Box flexGrow={1} flexDirection="column">
            <Box justifyContent="space-between">
              <Text bold>{stepLabels[step]}</Text>
              <Text color={tuiTheme.muted}>Step {displayIndex}/7</Text>
            </Box>
            <Box marginTop={1}>
              <Text color={tuiTheme.muted}>{help ?? "↑/↓ 循环选择 · Enter 确认 · Esc 返回 · Cmd+X 清空 · Ctrl+C 取消"}</Text>
            </Box>
            {error ? (
              <Box marginTop={1}>
                <StatusMessage variant="error">{error}</StatusMessage>
              </Box>
            ) : null}
            <Box marginTop={1} flexDirection="column">
              {children}
            </Box>
          </Box>
        </Box>
        <Box marginTop={1}>
          <Text color={tuiTheme.muted}>↑/↓ 循环选择   Enter 确认   Esc 返回   Cmd+X 清空   Ctrl+C 取消</Text>
        </Box>
      </Box>
    </Box>
  );
}

function PreviewBlock({ result }: { result: FlowResult }) {
  return (
    <Box flexDirection="column">
      {result.group ? (
        <Box flexDirection="column" marginBottom={1}>
          <Text color={tuiTheme.accent}>New group</Text>
          <Text>{renderGroup(result.group)}</Text>
        </Box>
      ) : null}
      <Text color={tuiTheme.accent}>New resource</Text>
      <Text>{renderEntry(result.resource)}</Text>
    </Box>
  );
}

function AddResourceTui({ options }: { options: TuiOptions }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const terminalWidth = stdout.columns || 120;
  const [step, setStep] = useState<Step>("group");
  const [state, setState] = useState<FormState>({});
  const [error, setError] = useState<string>();
  const [writing, setWriting] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [typeIndex, setTypeIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [inlineGroupTitle, setInlineGroupTitle] = useState("");
  const [inlineCustomType, setInlineCustomType] = useState("");
  const [groupIdDraft, setGroupIdDraft] = useState("");
  const [blinkOn, setBlinkOn] = useState(true);
  const groupIndexRef = useRef(groupIndex);
  const typeIndexRef = useRef(typeIndex);
  const statusIndexRef = useRef(statusIndex);

  const selectedGroupTitle = state.group?.title ?? state.newGroup?.title;
  const typeOptions = selectedGroupTitle ? typesForGroup(selectedGroupTitle) : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setBlinkOn((current) => !current);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    groupIndexRef.current = groupIndex;
  }, [groupIndex]);

  useEffect(() => {
    typeIndexRef.current = typeIndex;
  }, [typeIndex]);

  useEffect(() => {
    statusIndexRef.current = statusIndex;
  }, [statusIndex]);

  function appendTextField(field: TextField, input: string) {
    setState((current) => ({ ...current, [field]: `${current[field] ?? ""}${input}` }));
    setError(undefined);
  }

  function backspaceTextField(field: TextField) {
    setState((current) => ({ ...current, [field]: (current[field] ?? "").slice(0, -1) }));
    setError(undefined);
  }

  function clearTextField(field: TextField) {
    setState((current) => ({ ...current, [field]: "" }));
    setError(undefined);
  }

  function appendGroupIdDraft(input: string) {
    setGroupIdDraft((value) => value + input);
    setError(undefined);
  }

  function backspaceGroupIdDraft() {
    setGroupIdDraft((value) => value.slice(0, -1));
    setError(undefined);
  }

  function moveGroupIndex(delta: number) {
    const nextIndex = moveWrapped(groupIndexRef.current, delta, groupOptions.length);
    groupIndexRef.current = nextIndex;
    setGroupIndex(nextIndex);
  }

  function moveTypeIndex(delta: number) {
    const nextIndex = moveWrapped(typeIndexRef.current, delta, renderedTypeOptions.length);
    typeIndexRef.current = nextIndex;
    setTypeIndex(nextIndex);
  }

  function moveStatusIndex(delta: number) {
    const nextIndex = moveWrapped(statusIndexRef.current, delta, statusOptions.length);
    statusIndexRef.current = nextIndex;
    setStatusIndex(nextIndex);
  }
  const groupOptions = useMemo<SelectOption[]>(() => [
    ...resourceGroups.map((group) => ({
      label: group.title,
      value: group.title,
      description: group.description,
    })),
    {
      label: "+ 新建分组",
      value: "__new_group__",
      description: "停在这一行直接输入新分组标题，Enter 后自动生成 id。",
    },
  ], []);
  const renderedTypeOptions = useMemo<SelectOption[]>(() => [
    ...typeOptions.map((type) => ({
      label: type,
      value: type,
      description: `当前分组「${selectedGroupTitle}」里的已有类型。`,
    })),
    {
      label: "+ 自行输入类型",
      value: "__custom_type__",
      description: "当前分组没有合适类型时，直接在这一行输入新 type。",
    },
  ], [selectedGroupTitle, typeOptions]);
  const statusOptions = useMemo<SelectOption[]>(() => [
    {
      label: "curated",
      value: "curated",
      description: "已精选、链接可用、会正常展示。",
    },
    {
      label: "pending",
      value: "pending",
      description: "待研究、候选资源或占位链接。",
    },
  ], []);
  const previewResult = useMemo<FlowResult | null>(() => {
    if (!selectedGroupTitle || !state.type || !state.name || !state.url || !state.use || !state.status) {
      return null;
    }
    try {
      return {
        group: state.newGroup,
        resource: buildResource({
          group: selectedGroupTitle,
          type: state.type,
          name: state.name,
          url: state.url,
          use: state.use,
          status: state.status,
        }),
      };
    } catch {
      return null;
    }
  }, [selectedGroupTitle, state]);

  function goBack() {
    setError(undefined);
    if (step === "group") {
      exit();
      return;
    }
    if (step === "new-group-title") setStep("group");
    else if (step === "new-group-id-preview") setStep("group");
    else if (step === "new-group-id-edit") setStep("new-group-id-preview");
    else if (step === "new-group-description") setStep("new-group-id-preview");
    else if (step === "new-group-preview") setStep("new-group-description");
    else setStep(previousLinearStep(step, state));
  }

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
      return;
    }
    if (step === "done" && (key.return || isEsc(input) || key.escape)) {
      exit();
      return;
    }
    if (isEsc(input) || key.escape) {
      goBack();
      return;
    }
    if (step === "group") {
      const selectedGroupOption = groupOptions[groupIndexRef.current]?.value;
      if (key.downArrow) {
        setError(undefined);
        moveGroupIndex(1);
        return;
      }
      if (key.upArrow) {
        setError(undefined);
        moveGroupIndex(-1);
        return;
      }
      if (selectedGroupOption === "__new_group__" && isClearShortcut(input, key)) {
        setInlineGroupTitle("");
        setError(undefined);
        return;
      }
      if (selectedGroupOption === "__new_group__" && key.backspace) {
        setInlineGroupTitle((value) => value.slice(0, -1));
        setError(undefined);
        return;
      }
      if (selectedGroupOption === "__new_group__" && printableInput(input)) {
        setInlineGroupTitle((value) => value + input);
        setError(undefined);
        return;
      }
      if (key.return) {
        const value = selectedGroupOption;
        setError(undefined);
        if (value === "__new_group__") {
          const title = inlineGroupTitle.trim();
          if (!title) {
            setError("新分组 title 不能为空。");
            return;
          }
          if (groupExists(title)) {
            setError(`分组 "${title}" 已存在。`);
            return;
          }
          const id = generateUniqueGroupId(title);
          setState({ groupTitle: title, groupId: id });
          setInlineGroupTitle(title);
          setGroupIdDraft("");
          setStep("new-group-id-preview");
          return;
        }
        const group = resourceGroups.find((item) => item.title === value);
        if (!group) {
          setError("没有找到这个分组。");
          return;
        }
        setState({ group });
        typeIndexRef.current = 0;
        setTypeIndex(0);
        setInlineCustomType("");
        setStep("type");
      }
      return;
    }
    if (step === "type") {
      const selectedTypeOption = renderedTypeOptions[typeIndexRef.current]?.value;
      if (key.downArrow) {
        setError(undefined);
        moveTypeIndex(1);
        return;
      }
      if (key.upArrow) {
        setError(undefined);
        moveTypeIndex(-1);
        return;
      }
      if (selectedTypeOption === "__custom_type__" && key.backspace) {
        setInlineCustomType((value) => value.slice(0, -1));
        setError(undefined);
        return;
      }
      if (selectedTypeOption === "__custom_type__" && isClearShortcut(input, key)) {
        setInlineCustomType("");
        setError(undefined);
        return;
      }
      if (selectedTypeOption === "__custom_type__" && printableInput(input)) {
        setInlineCustomType((value) => value + input);
        setError(undefined);
        return;
      }
      if (key.return) {
        const value = selectedTypeOption;
        setError(undefined);
        if (value === "__custom_type__") {
          const type = inlineCustomType.trim();
          if (!type) {
            setError("自定义类型不能为空。");
            return;
          }
          setState((current) => ({ ...current, type }));
          setStep("name");
          return;
        }
        setState((current) => ({ ...current, type: value }));
        setStep("name");
      }
      return;
    }
    if (step === "status") {
      if (key.downArrow) {
        moveStatusIndex(1);
        return;
      }
      if (key.upArrow) {
        moveStatusIndex(-1);
        return;
      }
      if (key.return) {
        const value = statusOptions[statusIndexRef.current]?.value as ResourceStatus | undefined;
        if (!value) return;
        setState((current) => ({ ...current, status: value }));
        setError(undefined);
        setStep("preview");
      }
      return;
    }
    if (step === "new-group-title") {
      if (isClearShortcut(input, key)) {
        clearTextField("groupTitle");
        return;
      }
      if (key.backspace) {
        backspaceTextField("groupTitle");
        return;
      }
      if (printableInput(input)) {
        appendTextField("groupTitle", input);
        return;
      }
      if (key.return) {
        const title = (state.groupTitle ?? "").trim();
        if (!title) {
          setError("新分组 title 不能为空。");
          return;
        }
        if (groupExists(title)) {
          setError(`分组 "${title}" 已存在。`);
          return;
        }
        const id = generateUniqueGroupId(title);
        setState((current) => ({ ...current, groupTitle: title, groupId: id }));
        setError(undefined);
        setStep("new-group-id-preview");
      }
      return;
    }
    if (step === "new-group-id-preview" && input.toLowerCase() === "e") {
      setError(undefined);
      setGroupIdDraft(state.groupId ?? "");
      setStep("new-group-id-edit");
      return;
    }
    if (step === "new-group-id-preview" && key.return) {
      setError(undefined);
      setStep("new-group-description");
      return;
    }
    if (step === "new-group-id-edit") {
      if (isClearShortcut(input, key)) {
        setGroupIdDraft("");
        setError(undefined);
        return;
      }
      if (key.backspace) {
        backspaceGroupIdDraft();
        return;
      }
      if (printableInput(input)) {
        appendGroupIdDraft(input);
        return;
      }
      if (key.return) {
        const id = groupIdDraft.trim();
        if (!isValidGroupId(id)) {
          setError("id 只能使用小写字母、数字和连字符。");
          return;
        }
        if (groupIdExists(id)) {
          setError(`分组 id "${id}" 已存在。`);
          return;
        }
        setState((current) => ({ ...current, groupId: id }));
        setError(undefined);
        setStep("new-group-id-preview");
      }
      return;
    }
    if (step === "new-group-description") {
      if (isClearShortcut(input, key)) {
        clearTextField("groupDescription");
        return;
      }
      if (key.backspace) {
        backspaceTextField("groupDescription");
        return;
      }
      if (printableInput(input)) {
        appendTextField("groupDescription", input);
        return;
      }
      if (key.return) {
        const title = state.groupTitle;
        const id = state.groupId;
        const description = state.groupDescription ?? "";
        if (!title || !id) {
          setError("缺少新分组标题或 id。");
          return;
        }
        try {
          const group = validateNewGroup(title, id, description);
          setState((current) => ({
            ...current,
            groupDescription: description.trim(),
            newGroup: group,
          }));
          setError(undefined);
          setStep("new-group-preview");
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
      return;
    }
    if (step === "new-group-preview" && key.return) {
      setError(undefined);
      const group = state.newGroup;
      if (!group) {
        setError("新分组还没有生成。");
        return;
      }
      setState((current) => ({ ...current, group: undefined, newGroup: group }));
      setStep("type");
      return;
    }
    if (step === "name") {
      if (isClearShortcut(input, key)) {
        clearTextField("name");
        return;
      }
      if (key.backspace) {
        backspaceTextField("name");
        return;
      }
      if (printableInput(input)) {
        appendTextField("name", input);
        return;
      }
      if (key.return) {
        const name = (state.name ?? "").trim();
        if (!name) {
          setError("资源名字不能为空。");
          return;
        }
        setState((current) => ({ ...current, name }));
        setError(undefined);
        setStep("url");
      }
      return;
    }
    if (step === "url") {
      if (isClearShortcut(input, key)) {
        clearTextField("url");
        return;
      }
      if (key.backspace) {
        backspaceTextField("url");
        return;
      }
      if (printableInput(input)) {
        appendTextField("url", input);
        return;
      }
      if (key.return) {
        const url = (state.url ?? "").trim();
        if (!url) {
          setError("URL 不能为空。");
          return;
        }
        if (!isValidUrl(url)) {
          setError("URL 必须是 http://、https:// 或 #。");
          return;
        }
        const duplicate = urlTaken(url);
        if (duplicate) {
          setError(`URL 已被「${duplicate}」使用。`);
          return;
        }
        setState((current) => ({ ...current, url, status: url === "#" ? "pending" : current.status }));
        statusIndexRef.current = url === "#" ? 1 : 0;
        setStatusIndex(url === "#" ? 1 : 0);
        setError(undefined);
        setStep("use");
      }
      return;
    }
    if (step === "use") {
      if (isClearShortcut(input, key)) {
        clearTextField("use");
        return;
      }
      if (key.backspace) {
        backspaceTextField("use");
        return;
      }
      if (printableInput(input)) {
        appendTextField("use", input);
        return;
      }
      if (key.return) {
        const use = (state.use ?? "").trim();
        if (!use) {
          setError("使用场景不能为空。");
          return;
        }
        setState((current) => ({ ...current, use }));
        setError(undefined);
        setStep("status");
      }
      return;
    }
    if (step === "preview" && key.return && previewResult && !writing) {
      setWriting(true);
      writeFlowResult(previewResult, options)
        .then(() => {
          setStep("done");
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          setWriting(false);
        });
    }
  });

  if (step === "done") {
    return (
      <Frame terminalWidth={terminalWidth} step="done" help="资源处理完成。Enter 或 Esc 退出。">
        <StatusMessage variant="success">{options.dryRun ? "dry-run 完成，没有写入文件。" : "资源已写入。"}</StatusMessage>
        <Text color="gray">Next: git diff src/data/groups.json src/data/resources.json</Text>
        <Text color="gray">Next: bun run build</Text>
      </Frame>
    );
  }

  if (step === "group") {
    return (
      <Frame
        terminalWidth={terminalWidth}
        step={step}
        error={error}
        help="↑/↓ 循环选择；停在最后一行可直接输入新分组标题。"
      >
        <OptionList
          blinkOn={blinkOn}
          customInput={inlineGroupTitle}
          customInputOptionValue="__new_group__"
          customInputWidth={36}
          options={groupOptions}
          focusedIndex={groupIndex}
        />
      </Frame>
    );
  }

  if (step === "new-group-title") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="输入分组中文标题。Enter 确认 · Esc 返回分组选项">
        <UnderlinedInput blinkOn={blinkOn} value={state.groupTitle} />
      </Frame>
    );
  }

  if (step === "new-group-id-preview") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="Enter 接受自动 ID · E 编辑 ID · Esc 返回分组">
        <Text>title: <Text color="cyan">{state.groupTitle}</Text></Text>
        <Text>auto id: <Text color="yellow">{state.groupId}</Text></Text>
      </Frame>
    );
  }

  if (step === "new-group-id-edit") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="只能使用小写字母、数字和连字符。Enter 确认 · Esc 返回 ID 预览">
        <UnderlinedInput blinkOn={blinkOn} value={groupIdDraft} />
      </Frame>
    );
  }

  if (step === "new-group-description") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="输入新分组描述。Enter 确认 · Esc 返回 ID 预览">
        <UnderlinedInput blinkOn={blinkOn} value={state.groupDescription} width={64} />
      </Frame>
    );
  }

  if (step === "new-group-preview") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="Enter 确认新分组并继续 · Esc 返回描述">
        {state.newGroup ? <Text>{renderGroup(state.newGroup)}</Text> : <Text color="red">新分组未生成。</Text>}
      </Frame>
    );
  }

  if (step === "type") {
    return (
      <Frame
        terminalWidth={terminalWidth}
        step={step}
        error={error}
        help={`当前分组：${selectedGroupTitle ?? "未选择"}。↑/↓ 循环选择；选到自定义时可直接输入。`}
      >
        {resourcesForGroup(selectedGroupTitle ?? "").length ? (
          <Text color={tuiTheme.muted}>资源示例: {resourcesForGroup(selectedGroupTitle ?? "").join(" / ")}</Text>
        ) : null}
        <OptionList
          blinkOn={blinkOn}
          customInput={inlineCustomType}
          customInputOptionValue="__custom_type__"
          customInputWidth={28}
          focusedIndex={typeIndex}
          options={renderedTypeOptions}
        />
      </Frame>
    );
  }

  if (step === "name") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="输入资源显示名。Enter 确认 · Esc 返回类型">
        <UnderlinedInput blinkOn={blinkOn} value={state.name} />
      </Frame>
    );
  }

  if (step === "url") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="输入 http(s) 链接；占位资源可填 #。Enter 确认 · Esc 返回资源名">
        <UnderlinedInput blinkOn={blinkOn} value={state.url} width={64} />
      </Frame>
    );
  }

  if (step === "use") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help={`说明什么时候打开这个资源。分组：${selectedGroupTitle ?? "未选择"}`}>
        <UnderlinedInput blinkOn={blinkOn} value={state.use} width={64} />
      </Frame>
    );
  }

  if (step === "status") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="选择资源状态。Enter 确认 · Esc 返回使用场景">
        <OptionList options={statusOptions} focusedIndex={statusIndex} />
      </Frame>
    );
  }

  if (step === "preview") {
    return (
      <Frame terminalWidth={terminalWidth} step={step} error={error} help="Enter 写入 · Esc 返回状态 · Ctrl+C 取消">
        {previewResult ? <PreviewBlock result={previewResult} /> : <Text color="red">预览生成失败，请返回检查字段。</Text>}
        {options.dryRun ? <Text color="yellow">dry-run: 不会写入文件，也不会抓 favicon。</Text> : null}
        {writing ? <Text color="yellow">Writing...</Text> : null}
      </Frame>
    );
  }

  return null;
}

export async function runAddResourceTui(options: TuiOptions): Promise<void> {
  await new Promise<void>((resolve) => {
    const instance = render(<AddResourceTui options={options} />);
    instance.waitUntilExit().then(() => resolve());
  });
}
