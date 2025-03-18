import React, { useEffect, useRef, useState } from "react";
import useYjs from "./useYjs";

interface TextEditorProps {
  roomName: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ roomName }) => {
  const { ytext, awareness } = useYjs(roomName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);

  // 文本内容同步
  useEffect(() => {
    if (!ytext) return;

    // 初始化文本
    setText(ytext.toString());

    // 监听文本变化
    const observer = (event: any) => {
      // 避免光标跳转问题
      const textarea = textareaRef.current;
      if (textarea) {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        setText(ytext.toString());
        // 恢复光标位置
        setTimeout(() => {
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionEnd;
        }, 0);
      } else {
        setText(ytext.toString());
      }
    };

    ytext.observe(observer);
    return () => ytext.unobserve(observer);
  }, [ytext]);

  // 处理输入变化
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    const oldText = text;

    if (!ytext || newText === oldText) return;

    // 优化更新方式，只更新变化的部分而不是整个文本
    const selectionStart = event.target.selectionStart;

    // 寻找起始差异位置
    let start = 0;
    while (
      start < Math.min(oldText.length, newText.length) &&
      oldText[start] === newText[start]
    ) {
      start++;
    }

    // 寻找结尾差异位置（从后往前）
    let oldEnd = oldText.length - 1;
    let newEnd = newText.length - 1;
    while (
      oldEnd >= start &&
      newEnd >= start &&
      oldText[oldEnd] === newText[newEnd]
    ) {
      oldEnd--;
      newEnd--;
    }

    // 计算删除和插入
    const delCount = oldEnd - start + 1;
    const insertText = newText.slice(start, newEnd + 1);

    // 应用更改到ytext
    ytext.delete(start, delCount);
    ytext.insert(start, insertText);

    // 更新本地状态
    setText(newText);
  };

  // 处理 awareness 更新
  useEffect(() => {
    if (!awareness) return;

    // 设置本地用户状态
    const userId = Math.floor(Math.random() * 10000).toString();
    const userColor = getRandomColor();

    awareness.setLocalStateField("user", {
      id: userId,
      name: `用户${userId}`,
      color: userColor,
      // 光标位置可以在这里添加
    });

    // 监听其他用户的状态变化
    const updateAwareness = () => {
      const states: any[] = [];
      awareness.getStates().forEach((state, clientId) => {
        if (state.user) {
          states.push({
            clientId,
            user: state.user,
          });
        }
      });
      setUsers(states);
    };

    awareness.on("update", updateAwareness);
    updateAwareness();

    return () => {
      awareness.off("update", updateAwareness);
      awareness.setLocalStateField("user", null);
    };
  }, [awareness]);

  const getRandomColor = (): string => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <h3>协同编辑室: {roomName}</h3>
        <div>
          当前在线用户: {users.length}
          <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>
            {users.map((user) => (
              <li
                key={user.clientId}
                style={{
                  backgroundColor: user.user.color,
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  marginRight: "5px",
                }}
              >
                {user.user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        style={{
          width: "100%",
          minHeight: "300px",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "16px",
          lineHeight: "1.5",
        }}
        placeholder="在此处输入文本进行协同编辑..."
      />
    </div>
  );
};

export default TextEditor;
