import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { space, type } from "@workday/canvas-kit-react/tokens";
import { LoadingDots } from "@workday/canvas-kit-react/loading-animation";
import { Popper } from "@workday/canvas-kit-react/popup";
import { Toast } from "@workday/canvas-kit-react/toast";

import MySidePanel from '../../common/components/SidePanel';
import SiteLocator from './SiteLocator';
import SiteManager from './SiteManager';
import SiteCreator from './SiteCreator';

const EnergySites = () => {

    const toastsAnchorRef = useRef();
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isPageSubmitDisabled, setIsPageSubmitDisabled] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [sidePanelOpen, setSidePanelOpen] = useState(true);
    const [innerApp, setInnerApp] = useState(1);
    const innerApps = [
      {
        index: 1,
        app: <SiteLocator sidePanelOpen={sidePanelOpen}></SiteLocator>
      },
      {
        index: 2,
        app: <SiteManager sidePanelOpen={sidePanelOpen}></SiteManager>
      },
      {
        index: 3,
        app: <SiteCreator sidePanelOpen={sidePanelOpen}></SiteCreator>
      }
    ]


    return <>

        <MySidePanel
          setSidePanelOpen={setSidePanelOpen}
          setInnerApp={setInnerApp}
        />

        <Window 
          sidePanelOpen={sidePanelOpen}
          > 

          {/* <MySidePanel
            setSidePanelOpen={setSidePanelOpen}
            setInnerApp={setInnerApp}
          ></MySidePanel> */}

          <LayoutContainer ref={toastsAnchorRef}>

            <Popper placement="top" open={toasts.length > 0} anchorElement={toastsAnchorRef}>
                {toasts.map((toast) => <Toast key={toast.key} iconColor={toast.color} icon={toast.icon} onClose={() => setToasts(toasts.filter((t) => t.key !== toast.key))}>{toast.text} </Toast>)}
            </Popper>

            {isPageLoading ? <LoadingAnimation />
                :
                (
                  <>

                    {/* TESTING */}
                    {/* <SiteLocator></SiteLocator> */}
                    {/* <SiteManager></SiteManager> */}
                    {/* <SiteCreator></SiteCreator> */}

                    {innerApps.map((app) => {
                      var index = app.index;
                      var app = app.app;
                      if (index === innerApp) {
                        return (app)
                      }
                    })}
                  </>
                )
            }

          </LayoutContainer>

        </Window>

      </>
}

const LoadingAnimation = styled(LoadingDots) ({
  left: "calc(50% - 38px)",
  position: "absolute",
  top: "50%"
});
  
const LayoutContainer = styled('div') ({
  marginLeft: space.m,
  marginRight: space.m,
  paddingBottom: space.xxl
});
  
const LayoutSectionTitle = styled('h2') ({
  ...type.levels.heading.small
});

const Window = styled('div') (
  {
    marginTop: "0px",
    marginLeft: '64px',
    paddingTop: '0px'

    // position: 'fixed',
    // display: 'none',
    // width: '100%',
    // height: '100%',
    // top: '0',
    // left: '0',
    // right: '0',
    // bottom: '0',
    // backgroundColor: 'rgba(0,0,0,0.5)',
    // zIndex: '2',
    // cursor: 'pointer',

  },
  ({sidePanelOpen}) => ({
    marginLeft: sidePanelOpen ? '320px' : '64px',
  }),
);

export default EnergySites;