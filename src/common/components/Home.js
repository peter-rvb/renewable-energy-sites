import * as React from 'react';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';

import { Card } from "@workday/canvas-kit-react/card";
import { colors, space, type } from "@workday/canvas-kit-react/tokens";
import { Layout } from "@workday/canvas-kit-react/layout";
import { AppletIcon } from "@workday/canvas-kit-react/icon";
import { fallbackIcon, workerSpendIcon, onboardingIcon } from '@workday/canvas-applet-icons-web';

import PageHeader from './PageHeader';

const Home = () => {
  return (
    <React.Fragment>
      <PageHeader title="Home" />
      <CardLayout>
          <CardLink to='/energy-sites'>
            <HomeCard depth={2}>
              <Card.Body>
                <AppletIcon icon={onboardingIcon} />
                <CardHeader>Renewable Energy Site Locator</CardHeader>
                <CardDescription>Discover where in the world we are tapping into renewable energy. [Workday Canvas Kit]</CardDescription>
              </Card.Body>
            </HomeCard>
          </CardLink>
          <CardLink to='/energy-sites-bootstrap'>
            <HomeCardComingSoon depth={2}>
              <Card.Body>
                <AppletIcon icon={onboardingIcon} />
                <CardHeader>Renewable Energy Site Locator</CardHeader>
                <CardDescription>Discover where in the world we are tapping into renewable energy. [React-Bootstrap]</CardDescription>
              </Card.Body>
            </HomeCardComingSoon>
          </CardLink>
      </CardLayout>
    </React.Fragment>
  );
};

const CardLayout = styled(Layout) ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  padding: space.l,
  marginTop: space.l
});

const CardDescription = styled("p") ({
  ...type.levels.subtext.large
});

const CardHeader = styled("h2") ({
  ...type.levels.heading.small
});


const CardLink = styled(Link) ({
  textDecoration: "none"
});

const HomeCard = styled(Card) ({
  alignItems: "center",
  display: "flex",
  height: "250px",
  justifyContent: "center",
  marginBottom: space.l,
  marginRight: space.l,
  padding: space.l,
  textAlign: "center",
  width: "450px",
  [`&:hover`]: {
    backgroundColor: colors.soap100
  }
});

const HomeCardComingSoon = styled(HomeCard) ({
  backgroundColor: `${colors.soap100} !important`
});

export default Home;
