import * as React from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import throttle from 'lodash/throttle';

import {colors, space } from '@workday/canvas-kit-react/tokens';
import { onboardingIcon } from '@workday/canvas-applet-icons-web';

import SidePanel from '@workday/canvas-kit-react/side-panel';
import { SystemIcon } from "@workday/canvas-kit-react/icon";
import { AppletIcon } from "@workday/canvas-kit-react/icon";
import {
    locationIcon,
    clipboardPlusIcon,
    dashboardIcon,
    transformationImportIcon,
    xIcon
  } from "@workday/canvas-system-icons-web"

const MySidePanel = ({setSidePanelOpen, setInnerApp}) => {

    const [open, setOpen] = useState(false);
    const [appSelected, setAppSelected] = useState(1);

    const apps = [
        {
          appTitle: "Site Locator",
          appIcon: locationIcon,
          appIndex: 1,
          key: 1
        },
        {
          appTitle: "Site Manager",
          appIcon: dashboardIcon,
          appIndex: 2,
          key: 2
        },
        {
          appTitle: "Site Creator",
          appIcon: clipboardPlusIcon,
          appIndex: 3,
          key: 3
        }
      ];

    const handleClickApp = (appIndex) => {
        // console.log(`Selected App ${appIndex}`);
        setAppSelected(appIndex);
        // return to index
        setInnerApp(appIndex);
    }

    const handleClickOpen = () => {
        console.log(`Side panel toggle`);
        setOpen(!open);
        // return to index
        setSidePanelOpen(!open)
    }

    const header = <>
        <HeaderDiv>
            <HeaderIconDiv>
                <AppletIcon icon={onboardingIcon} size={50}/>
            </HeaderIconDiv>
            <HeaderTitleDiv>
                <Header>Energy Sites App Hub</Header>
            </HeaderTitleDiv>
            <div>
                <SystemIcon 
                    icon={xIcon} 
                    accentHover={colors.blueberry500} 
                    colorHover={colors.blueberry500}
                    onClick={handleClickOpen} />
            </div>
        </HeaderDiv>
    </>

    return (
        <>
            {/* <SidePanel
                backgroundColor={SidePanel.BackgroundColor.Gray}
                openDirection={SidePanel.OpenDirection.Left}
                open={open}
                onToggleClick={this.onClick}
                breakpoint={800}
                onBreakpointChange={this.handleBreakpoint}
                header={'Side Panel Header'}
            >
                {/* {open ? (
                <SecondaryButton variant="primary">Add New</SecondaryButton>
                ) : (
                <TertiaryButton size="small" variant="filled">
                    <SystemIcon icon={plusIcon} />
                </TertiaryButton>
                )}
                <ul>
                    <li>{open && <span>Home</span>}</li>
                    <li>{open && <span>Favorites</span>}</li>
                    <li>{open && <span>Items</span>}</li>
                </ul> */}
            {/* </SidePanel> */} 

            <SidePanel
                open={open}
                header={header}
                backgroundColor={SidePanel.BackgroundColor.Gray}
                css={{zIndex:'2'}}
                
                // width={'600px'}
            >

                <ChildrenContainer>

                    <MenuList>

                        {/* OPEN SIDE PANEL */}
                        {open ? null : 

                            <>
                                <MenuItem>
                                    <MenuButton onClick={handleClickOpen}>
                                        <SystemIcon icon={transformationImportIcon} 
                                            accentHover={colors.blueberry500} 
                                            colorHover={colors.blueberry500}/>
                                    </MenuButton>
                                </MenuItem>

                                {/* SPACING */}
                                <div style={{minHeight:'25px'}}></div>
                            </>
                        }

                        {apps.map((app) => 
                            {return <MenuItem key={app.key}>
                                <MenuButton onClick={() => {handleClickApp(app.appIndex)}}>
                                    
                                    <MenuItemIconSpan>
                                        <SystemIcon 
                                            icon={app.appIcon} 
                                            accentHover={colors.blueberry500} 
                                            colorHover={colors.blueberry500} />
                                    </MenuItemIconSpan>

                                    {open ? 
                                    <MenuItemTitleSpan>
                                        {/* {app.appTitle} */}
                                        <MenuItemTitle>{app.appTitle}</MenuItemTitle>
                                    </MenuItemTitleSpan>
                                    : null}
                                
                                </MenuButton>
                            </MenuItem>
                            }
                        )}

                    </MenuList>

                </ChildrenContainer>

            </SidePanel>

        </>
    )
}

const closedWidth = space.xxl;

const SidePanelBackgroundColor = {
    Transparent: 'Transparent',
    White: 'White',
    Gray: 'Gray'
}

const SidePanelOpenDirection = {
    Left: 'Left',
    Right: 'Right'
}

const SidePanelContainer = styled(SidePanel) (
  {
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 200ms ease',
    position: 'absolute',
    padding: '0px'
  },
  ({open}) => ({
    alignItems: open ? undefined : 'center',
    boxShadow: open ? undefined : '0 8px 16px -8px rgba(0, 0, 0, 0.16)',
  }),
  ({open, backgroundColor}) => {
    let openBackgroundColor;

    switch (backgroundColor) {
      case SidePanelBackgroundColor.Transparent:
        openBackgroundColor = 'transparent';
        break;
      case SidePanelBackgroundColor.Gray:
        openBackgroundColor = colors.soap100;
        break;
      case SidePanelBackgroundColor.White:
      default:
        openBackgroundColor = colors.frenchVanilla100;
        break;
    }

    return {
      backgroundColor: open ? openBackgroundColor : colors.frenchVanilla100,
    };
  },
  ({open, openWidth}) => ({
    width: open ? openWidth : closedWidth,
  }),
  ({open, padding}) => ({
    padding: open ? padding || space.m : `${space.s} 0`,
  }),
  ({openDirection}) => ({
    right: openDirection === SidePanelOpenDirection.Right ? space.zero : undefined,
    left: openDirection === SidePanelOpenDirection.Left ? space.zero : undefined,
  })
);

// HEADER
const HeaderDiv = styled('div') (
    {
        // alignIitems: 'center',
        border: 'none',
        display: 'flex',
        outline: 'none',
        // padding: '24px 0px 16px 16px', 
        justifyContent: 'space-between',
        width: '250px',
        // verticalAlign: 'center',
    }
)

const HeaderIconDiv = styled('div') (
    {   
        // border: '1px solid red',
        // flex: '0 0 auto',
        // height: '56px',
        width: '48px',
        display: 'inherit',
        cursor: "pointer",
        // verticalAlign: 'middle',
        // maxHeight: '56px',
    }
)

const HeaderTitleDiv = styled('div') (
    {
        // border: '1px solid red',
        // display: 'inline-block',
        // verticalAlign: 'middle',
        width: '150px',
        height: '56px',
    }
)

const Header = styled('h1') ({
    // border: '1px solid red',
    fontWeight: '700',
    color: 'rgb(51, 51, 51)',
    fontSize: '20px',
    lineHeight: '28px',
    maxHeight: '56px',
    overflow: 'hidden',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    width: '100%',
    // verticlAlign: 'middle',
    margin: '0px'
  });


// CHILDREN

const ChildrenContainer = styled('div') (
  { 
    // transition: 'none',
    // zIndex: 1, // show above SidePanelFooter when screen is small vertically
    // paddingLeft: '0',
    // marginLeft: '0',
    width: '250px',

    margin: '0',
    padding: '0',
    border: '0',
    font: 'inherit',
    verticalAlign: 'baseline',
    display: 'block'
  },
  ({open, openWidth}) => ({
    width: open ? openWidth : closedWidth,
  })
);

const MenuList = styled('ul') ( 
    {
        padding: '0px',
        listStyle: 'none',
        width: '250px',
    }
)

const MenuItem = styled('li') (
    {
        padding: '0',
        margin: '0',
        verticlAlign: 'baseline',
        border: '0',
        font: 'inherit',
        // justifyContent: 'flex-start'
    }
)

const MenuButton = styled('button') (
    {   
        // height: '50px',
        // width: '250px',
        // paddingLeft: '0',

        alignItems: "center",
        cursor: "pointer",
        display: "flex",
        WebkitBoxPack: "justify",
        justifyContent: "space-between",
        padding: "12px 16px 12px 20px",
        width: "100%", 

        border: "none",
        backgroundColor: "transparent"
    }
)
 
const MenuItemIconSpan = styled('span') (
    {   
        display: 'inherit',
        border: '0',
        padding: '0',
        verticalAlign: 'baseline',
        color: 'rgb(73, 73, 73)',
        // justifyContent: 'center'
    }
)

const MenuItemTitleSpan = styled('span') (
    {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '700',
        color: 'rgb(73, 73, 73)',
        marginLeft: '24px',
        paddingRight: '0px',
        flex: '1 1 auto',
        overflow: 'hidden',
        textAlign: 'left',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        margin: '0',
        padding: '0',
        border: '0',
        font: 'inherit',
        verticalAlign: 'baseline',
    }
)

const MenuItemTitle = styled('span') (
    {
      color: 'rgb(73, 73, 73)',
      paddingLeft: '24px',
      fontWeight: '700',
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1rem',
      letterSpacing: '0.01rem',
      lineHeight: '1.5rem',
    },
    // ({open}) => ({
    //   alignItems: open ? undefined : 'center',
    //   boxShadow: open ? undefined : '0 8px 16px -8px rgba(0, 0, 0, 0.16)',
    // })
  );


export default MySidePanel