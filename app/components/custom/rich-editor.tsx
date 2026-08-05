import { CodeHighlightNode, CodeNode } from "@lexical/code";
import {
  AutoFocusExtension,
  ClearEditorExtension,
  DecoratorTextExtension,
  HorizontalRuleExtension,
  SelectionAlwaysOnDisplayExtension,
} from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import {
  AutoLinkExtension,
  ClickableLinkExtension,
  LinkExtension,
} from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import { OverflowNode } from "@lexical/overflow";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { RichTextExtension } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  type EditorState,
  type SerializedEditorState,
  configExtension,
  defineExtension,
} from "lexical";
import { useMemo, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MaxLengthExtension } from "@/components/editor/max-length-extension";
import { MarkdownShortcutsExtension } from "@/components/editor/markdown-shortcuts-extension";
import { TABLE } from "@/components/editor/markdown-table-transformer";
import { IMAGE } from "@/components/editor/markdown-image-transformer";
import { EMOJI } from "@/components/editor/markdown-emoji-transformer";
import { TWEET } from "@/components/editor/markdown-tweet-transformer";
import { validateUrl } from "@/components/editor/url";
import { EmojisExtension } from "@/components/editor/emojis-extension";
import { ImagesExtension } from "@/components/editor/images-extension";
import { DateTimeExtension } from "@/components/editor/date-time-extension";
import { editorTheme } from "@/components/editor/editor-theme";
import { ToolbarPlugin } from "@/components/editor/toolbar-plugin";
import { HistoryToolbarPlugin } from "@/components/editor/history-toolbar-plugin";
import { ContentEditable } from "@/components/editor/content-editable";
import { CounterCharacterPlugin } from "@/components/editor/counter-character-plugin";
import { SpeechToTextPlugin } from "@/components/editor/speech-to-text-plugin";
import { ShareContentPlugin } from "@/components/editor/share-content-plugin";
import { ImportExportPlugin } from "@/components/editor/import-export-plugin";
import { MarkdownTogglePlugin } from "@/components/editor/markdown-toggle-plugin";
import { EditModeTogglePlugin } from "@/components/editor/edit-mode-toggle-plugin";
import { ClearEditorActionPlugin } from "@/components/editor/clear-editor-plugin";
import { TreeViewPlugin } from "@/components/editor/tree-view-plugin";
import { ComponentPickerMenuPlugin } from "@/components/editor/component-picker-menu-plugin";
import {
  DynamicTablePickerPlugin,
  TablePickerPlugin,
} from "@/components/editor/table-picker-plugin";
import { EmojiPickerPlugin } from "@/components/editor/emoji-picker-plugin";
import { AutoEmbedPlugin } from "@/components/editor/auto-embed-plugin";
import { MentionsPlugin } from "@/components/editor/mentions-plugin";
import { AutoCompletePlugin } from "@/components/editor/auto-complete-plugin";
import { ContextMenuPlugin } from "@/components/editor/context-menu-plugin";
import { SpecialTextPlugin } from "@/components/editor/special-text-plugin";
import { TabFocusPlugin } from "@/components/editor/tab-focus-plugin";
import { CodeHighlightPlugin } from "@/components/editor/code-highlight-plugin";
import { LayoutPlugin } from "@/components/editor/layout-plugin";
import { TwitterPlugin } from "@/components/editor/twitter-plugin";
import { YouTubePlugin } from "@/components/editor/youtube-plugin";
import { DraggableBlockPlugin } from "@/components/editor/draggable-block-plugin";
import { CodeActionMenuPlugin } from "@/components/editor/code-action-menu-plugin";
import { ActionsPlugin } from "@/components/editor/actions-plugin";
import { BlockInsertPlugin } from "@/components/editor/block-insert-plugin";
import { InsertHorizontalRule } from "@/components/editor/insert-horizontal-rule";
import { InsertImage } from "@/components/editor/insert-image";
import { InsertTable } from "@/components/editor/insert-table";
import { InsertColumnsLayout } from "@/components/editor/insert-columns-layout";
import { InsertEmbeds } from "@/components/editor/insert-embeds";
import { ParagraphPickerPlugin } from "@/components/editor/paragraph-picker-plugin";
import { HeadingPickerPlugin } from "@/components/editor/heading-picker-plugin";
import { CheckListPickerPlugin } from "@/components/editor/check-list-picker-plugin";
import { NumberedListPickerPlugin } from "@/components/editor/numbered-list-picker-plugin";
import { BulletedListPickerPlugin } from "@/components/editor/bulleted-list-picker-plugin";
import { QuotePickerPlugin } from "@/components/editor/quote-picker-plugin";
import { CodePickerPlugin } from "@/components/editor/code-picker-plugin";
import { DividerPickerPlugin } from "@/components/editor/divider-picker-plugin";
import { EmbedsPickerPlugin } from "@/components/editor/embeds-picker-plugin";
import { ImagePickerPlugin } from "@/components/editor/image-picker-plugin";
import { ColumnsLayoutPickerPlugin } from "@/components/editor/columns-layout-picker-plugin";
import { DateTimePickerPlugin } from "@/components/editor/date-time-picker-plugin";
import { AlignmentPickerPlugin } from "@/components/editor/alignment-picker-plugin";
import { FormatParagraph } from "@/components/editor/format-paragraph";
import { FormatHeading } from "@/components/editor/format-heading";
import { FormatNumberedList } from "@/components/editor/format-numbered-list";
import { FormatBulletedList } from "@/components/editor/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/format-check-list";
import { FormatCodeBlock } from "@/components/editor/format-code-block";
import { FormatQuote } from "@/components/editor/format-quote";
import { CodeLanguageToolbarPlugin } from "@/components/editor/code-language-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "@/components/editor/font-family-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/components/editor/font-size-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/font-format-toolbar-plugin";
import { SubSuperToolbarPlugin } from "@/components/editor/subsuper-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/link-toolbar-plugin";
import { ClearFormattingToolbarPlugin } from "@/components/editor/clear-formatting-toolbar-plugin";
import { FontColorToolbarPlugin } from "@/components/editor/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "@/components/editor/font-background-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@/components/editor/element-format-toolbar-plugin";
import { EmojiNode } from "@/components/editor/emoji-node";
import { MentionNode } from "@/components/editor/mention-node";
import { AutocompleteNode } from "@/components/editor/autocomplete-node";
import { SpecialTextNode } from "@/components/editor/special-text-node";
import { LayoutContainerNode } from "@/components/editor/layout-container-node";
import { LayoutItemNode } from "@/components/editor/layout-item-node";
import { TweetNode } from "@/components/editor/tweet-node";
import { YouTubeNode } from "@/components/editor/youtube-node";
import { BlockFormatDropDown } from "@/components/editor/block-format-toolbar-plugin";
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/floating-text-format-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/floating-link-editor-plugin";
import { HR } from "../editor/markdown-hr-transformer";

const placeholder = "Press / for commands...";
const maxLength = 30;

export function RichEditor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
}) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const AppExtension = useMemo(
    () =>
      defineExtension({
        dependencies: [
          RichTextExtension,
          AutoFocusExtension,
          SelectionAlwaysOnDisplayExtension,
          HistoryExtension,
          configExtension(LinkExtension, {
            validateUrl,
            attributes: { rel: "noopener noreferrer", target: "_blank" },
          }),
          AutoLinkExtension,
          ClickableLinkExtension,
          configExtension(MaxLengthExtension, { disabled: false, maxLength }),
          configExtension(MarkdownShortcutsExtension, {
            transformers: [
              TABLE,
              HR,
              IMAGE,
              EMOJI,
              TWEET,
              CHECK_LIST,
              ...ELEMENT_TRANSFORMERS,
              ...MULTILINE_ELEMENT_TRANSFORMERS,
              ...TEXT_FORMAT_TRANSFORMERS,
              ...TEXT_MATCH_TRANSFORMERS,
            ],
          }),
          ClearEditorExtension,
          EmojisExtension,
          DecoratorTextExtension,
          configExtension(ListExtension, { shouldPreserveNumbering: false }),
          CheckListExtension,
          HorizontalRuleExtension,
          ImagesExtension,
          DateTimeExtension,
        ],
        name: "@shadcn-editor",
        namespace: "Playground",
        nodes: [
          OverflowNode,
          EmojiNode,
          MentionNode,
          AutocompleteNode,
          SpecialTextNode,
          CodeNode,
          CodeHighlightNode,
          TableNode,
          TableCellNode,
          TableRowNode,
          LayoutContainerNode,
          LayoutItemNode,
          TweetNode,
          YouTubeNode,
        ],
        $initialEditorState(editor) {
          if (editorSerializedState) {
            editor.parseEditorState(editorSerializedState);
          } else if (editorState) {
            editor.setEditorState(editorState);
          }
        },
        theme: editorTheme,
      }),
    [editorState, editorSerializedState],
  );

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow w-full">
      <LexicalExtensionComposer extension={AppExtension} contentEditable={null}>
        <TooltipProvider>
          <div className="relative">
            <ToolbarPlugin>
              {({ blockType }) => (
                <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
                  <HistoryToolbarPlugin />
                  <Separator orientation="vertical" className="h-7!" />
                  <BlockFormatDropDown>
                    <FormatParagraph />
                    <FormatHeading levels={["h1", "h2", "h3"]} />
                    <FormatNumberedList />
                    <FormatBulletedList />
                    <FormatCheckList />
                    <FormatCodeBlock />
                    <FormatQuote />
                  </BlockFormatDropDown>
                  {blockType === "code" ?
                    <CodeLanguageToolbarPlugin />
                  : <>
                      <FontFamilyToolbarPlugin />
                      <Separator orientation="vertical" className="h-7!" />
                      <FontSizeToolbarPlugin />
                      <FontFormatToolbarPlugin />
                      <SubSuperToolbarPlugin />
                      <LinkToolbarPlugin
                        setIsLinkEditMode={setIsLinkEditMode}
                      />
                      <ClearFormattingToolbarPlugin />
                      <FontColorToolbarPlugin />
                      <FontBackgroundToolbarPlugin />
                      <ElementFormatToolbarPlugin />
                      <BlockInsertPlugin>
                        <InsertHorizontalRule />
                        <InsertImage />
                        <InsertTable />
                        <InsertColumnsLayout />
                        <InsertEmbeds />
                      </BlockInsertPlugin>
                    </>
                  }
                </div>
              )}
            </ToolbarPlugin>
            <div className="relative">
              <div className="">
                <div className="" ref={onRef}>
                  <ContentEditable
                    placeholder={placeholder}
                    className="h-[calc(100vh-141px)] pl-4"
                  />
                </div>
              </div>
              <ComponentPickerMenuPlugin
                baseOptions={[
                  ParagraphPickerPlugin(),
                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),
                  TablePickerPlugin(),
                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),
                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  EmbedsPickerPlugin({ embed: "tweet" }),
                  EmbedsPickerPlugin({ embed: "youtube-video" }),
                  ImagePickerPlugin(),
                  ColumnsLayoutPickerPlugin(),
                  DateTimePickerPlugin(),
                  AlignmentPickerPlugin({ alignment: "left" }),
                  AlignmentPickerPlugin({ alignment: "center" }),
                  AlignmentPickerPlugin({ alignment: "right" }),
                  AlignmentPickerPlugin({ alignment: "justify" }),
                ]}
                dynamicOptionsFn={DynamicTablePickerPlugin}
              />
              <EmojiPickerPlugin />
              <AutoEmbedPlugin />
              <MentionsPlugin />
              <AutoCompletePlugin />
              <ContextMenuPlugin />
              <SpecialTextPlugin />
              <TabFocusPlugin />
              <TabIndentationPlugin />
              <CodeHighlightPlugin />
              <TablePlugin />
              <LayoutPlugin />
              <TwitterPlugin />
              <YouTubePlugin />
              <DraggableBlockPlugin
                anchorElem={floatingAnchorElem}
                baseOptions={[
                  ParagraphPickerPlugin(),
                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),
                  TablePickerPlugin(),
                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),
                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  EmbedsPickerPlugin({ embed: "tweet" }),
                  EmbedsPickerPlugin({ embed: "youtube-video" }),
                  ImagePickerPlugin(),
                  ColumnsLayoutPickerPlugin(),
                  DateTimePickerPlugin(),
                  AlignmentPickerPlugin({ alignment: "left" }),
                  AlignmentPickerPlugin({ alignment: "center" }),
                  AlignmentPickerPlugin({ alignment: "right" }),
                  AlignmentPickerPlugin({ alignment: "justify" }),
                ]}
                dynamicOptionsFn={DynamicTablePickerPlugin}
              />
              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            </div>
            <ActionsPlugin>
              <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
                <div className="flex flex-1 justify-start text-xs text-gray-500">
                  <CharacterLimitPlugin
                    maxLength={maxLength}
                    charset="UTF-16"
                  />
                </div>
                <div>
                  <CounterCharacterPlugin charset="UTF-16" />
                </div>
                <div className="flex flex-1 justify-end">
                  <SpeechToTextPlugin />
                  <ShareContentPlugin />
                  <ImportExportPlugin />
                  <MarkdownTogglePlugin
                    shouldPreserveNewLinesInMarkdown={true}
                    transformers={[
                      TABLE,
                      HR,
                      IMAGE,
                      EMOJI,
                      TWEET,
                      CHECK_LIST,
                      ...ELEMENT_TRANSFORMERS,
                      ...MULTILINE_ELEMENT_TRANSFORMERS,
                      ...TEXT_FORMAT_TRANSFORMERS,
                      ...TEXT_MATCH_TRANSFORMERS,
                    ]}
                  />
                  <EditModeTogglePlugin />
                  <ClearEditorActionPlugin />
                  <TreeViewPlugin />
                </div>
              </div>
            </ActionsPlugin>
          </div>

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalExtensionComposer>
    </div>
  );
}
