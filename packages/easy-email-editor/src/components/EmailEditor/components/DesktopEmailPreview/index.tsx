import React, { useMemo } from 'react';
import { useActiveTab } from '@/hooks/useActiveTab';
import { ActiveTabKeys } from '@/components/Provider/BlocksProvider';
import { usePreviewEmail } from '@/hooks/usePreviewEmail';
import { useEditorContext } from '@/hooks/useEditorContext';
import { SyncScrollShadowDom } from '@/components/UI/SyncScrollShadowDom';
import { classnames } from '@/utils/classnames';
import { SYNC_SCROLL_ELEMENT_CLASS_NAME } from '@/constants';
import { createPortal } from 'react-dom';

export interface DesktopEmailPreviewProps {
  noPadding?: boolean;
}

export const DesktopEmailPreview: React.FC<DesktopEmailPreviewProps> = ({
  noPadding = false,
}) => {
  const { activeTab } = useActiveTab();
  const { errMsg, reactNode } = usePreviewEmail();

  const { pageData } = useEditorContext();

  const fonts = useMemo(() => {
    return pageData.data.value.fonts || [];
  }, [pageData.data.value.fonts]);

  const isActive = activeTab === ActiveTabKeys.PC;

  if (errMsg) {
    return (
      <div style={{ textAlign: 'center', fontSize: 24, color: 'red' }}>
        <>{errMsg}</>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
      }}
    >
      <SyncScrollShadowDom
        isActive={isActive}
        style={{
          border: 'none',
          height: '100%',
          width: '100%',
        }}
      >
        <>
          <style>
            {`
                .preview-container {
                  overflow: overlay !important;
                }
                *::-webkit-scrollbar {
                  -webkit-appearance: none;
                  width: 0px;
                }
                *::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.5);
                  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                }
              `}
          </style>
          <div
            className={classnames('preview-container', SYNC_SCROLL_ELEMENT_CLASS_NAME)}
            style={{
              height: '100%',
              overflow: 'auto',
              margin: 'auto',

              ...(noPadding === true
                ? {}
                : {
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 40,
                  paddingBottom: 140,
                }),

              boxSizing: 'border-box',
            }}
          >
            <>{reactNode}</>
          </div>
          {createPortal(
            <>
              {fonts.map((item, index) => (
                <link
                  key={index}
                  href={item.href}
                  rel='stylesheet'
                  type='text/css'
                />
              ))}
            </>,
            document.body,
          )}
        </>
      </SyncScrollShadowDom>
    </div>
  );
}
