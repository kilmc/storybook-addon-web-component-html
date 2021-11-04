import React, { MouseEvent, useEffect, useState } from "react";
import { ActionBar, ScrollArea } from "@storybook/components";
import { useChannel } from "@storybook/api";
import { EVENT_CODE_RECEIVED } from "../constants";
import { format as prettierFormat } from "prettier/standalone";
import prettierHtml from "prettier/parser-html";
import ReactSyntaxHighlighter from "react-syntax-highlighter";
import posthtml from "posthtml";
import posthtmlPlugin from "../posthtmlPlugin";

const doClickStuff = (processedHTML: string) => {
  const tmp = document.createElement("textarea");
  const focus = document.activeElement as HTMLElement;

  tmp.value = processedHTML;

  document.body.appendChild(tmp);
  tmp.select();
  document.execCommand("copy");
  document.body.removeChild(tmp);
  focus.focus();
};

export const PanelContent: React.FC<{}> = () => {
  const [html, setHTML] = useState("");
  const [processedHTML, setProcessedHTML] = useState("");
  const [copied, setCopied] = useState(false);

  useChannel({
    [EVENT_CODE_RECEIVED]: (data) => {
      setHTML(data.html);
    },
  });

  useEffect(() => {
    const processHTML = async () => {
      const result = await posthtml([
        posthtmlPlugin({
          stringAttrs: [],
          safeAttrs: ["size", "class"],
        }),
      ]).process(html);

      if (typeof result.html === "string") {
        setProcessedHTML(result.html);
      }
    };

    setHTML(
      prettierFormat(html, {
        htmlWhitespaceSensitivity: "ignore",
        parser: "html",
        plugins: [prettierHtml],
      })
    );
    processHTML();
  }, [html, processedHTML]);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    doClickStuff(processedHTML);

    if (copied) {
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <>
      <ScrollArea vertical>
        <ReactSyntaxHighlighter
          language={"jsx"}
          useInlineStyles={true}
          wrapLines={true}
          lineProps={{ className: "code-line" }}
        >
          {processedHTML}
        </ReactSyntaxHighlighter>
      </ScrollArea>

      <ActionBar
        actionItems={[{ title: copied ? "Copied" : "Copy", onClick }]}
      />
    </>
  );
};
