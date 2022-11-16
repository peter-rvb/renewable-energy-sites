import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import styled from '@emotion/styled';
import { colors, space, type } from "@workday/canvas-kit-react/tokens";
import { LoadingDots } from "@workday/canvas-kit-react/loading-animation";
import { Popper } from "@workday/canvas-kit-react/popup";
import { Toast } from "@workday/canvas-kit-react/toast";
import { exclamationCircleIcon } from '@workday/canvas-system-icons-web';

import GoogleMap from '../../common/components/GoogleMap';
import { useLoadScript } from "@react-google-maps/api";

import { getEnergySites, getEnergySitesOffset } from './EnergySitesAppData';

// React-Bootstrap
// css
import 'bootstrap/dist/css/bootstrap.min.css';

// form
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

//layout
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// tabs
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// table
import Table from 'react-bootstrap/Table';

const ENERGY_SITES_APP_ID = process.env.REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES;
const TENANT_ALIAS = process.env.REACT_APP_WCP_DEFAULT_TENANT_ALIAS;

const EnergySites = () => {

    const toastsAnchorRef = useRef();
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isPageSubmitDisabled, setIsPageSubmitDisabled] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [energySites, setEnergySites] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [mapData, setMapData] = useState([]);
    const [cityFilter, setCityFilter] = useState('');

    const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });

    const tableHeaders = ["Site Name", "Site ID", "Energy Type", "Location", "Description", "Operational Date"];

    const getCoordinates = (energySite) => {
        if (!energySite.description) {
            var lat = 0; var lng = 0;
        } else if (!energySite.description.includes('Coordinates')) {
            lat = 0; lng = 0;
        } else {
            var coordinates = energySite.description.split('Coordinates:')[1];
            var parts = coordinates.split(",");
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
        }
        return { lat: lat, lng: lng }
    }

    const getSiteUpdateUrl = (energySite) => {
        var urlFirstPart = `https://wcpdev.wd101.myworkday.com/${TENANT_ALIAS}/d/wday/app/${ENERGY_SITES_APP_ID}/${ENERGY_SITES_APP_ID}/energySites/`;
        var urlSecondPart = `/update.htmld?energySiteId=`;
        var url = urlFirstPart + energySite.id + urlSecondPart + energySite.id;
        return url
    }

    useEffect(() => {
        setIsPageLoading(true);
        fetchEnergySites()
          .catch((error) => {
            console.error(error);
            setToasts([{ key: Date.now(), icon: exclamationCircleIcon, color: colors.cinnamon500, text: `Problem Retrieving Data: ${error.message}` }]);
          })
          .finally(() => setIsPageLoading(false));
      }, []);

    const fetchEnergySites = async() => {
        const energySites = await getEnergySites();
        // if (!energySites.data) {
        //     throw new Error(energySites.error) }

        if (!energySites.data) {
            if (energySites.error.includes("Unauthorized")) {
                throw new Error("You have been automatically signed out. Please login.");
            } else {
                throw new Error(energySites.error);
            }
        }

        var total = energySites.total;
        var limit = 100;
        var max = Math.ceil(total/limit);

        const fetchedEnergySites = [];

        for (var offset = 0; offset < max*limit; offset += limit) {
            var response = await getEnergySitesOffset(offset, limit);

            if (!response.data) { 
                throw new Error(energySites.error) }
             
            response.data.forEach((energySite) => {
                fetchedEnergySites.push({
                    key: uuid(),
                    siteName: energySite.siteName,
                    siteId: energySite.siteId,
                    energyType: energySite.energyType,
                    location: energySite.location,
                    description: energySite.description,
                    opDate: energySite.operationalDate,
                    workdayId: energySite.id,
                    url: getSiteUpdateUrl(energySite),
                    coordinates: getCoordinates(energySite),
                })
            })
        }

        console.log('Test');

        setEnergySites(fetchedEnergySites);
        setTableData(fetchedEnergySites);
        // setTableData(fetchedEnergySites.slice(currentPage, currentPage+pageLimit));
        setMapData(fetchedEnergySites);
    }

    const handleSubmitCity = async() => {
        if (cityFilter === '') {
            console.log(`Reset city filter`);
            return await fetchEnergySites() }

        // RESET ENERGY SITES
        await fetchEnergySites()
        
        console.log(`Filtering sites for city: ${cityFilter}`);

        const filteredSites = energySites.filter(energySite => 
            energySite.location.includes(cityFilter)
        );

        console.log(`Filtered sites: ${filteredSites.length}`);

        setTableData(filteredSites);
        setMapData(filteredSites);
    }

    // TABS
    const [key, setKey] = useState('report');

    return <>

        <Window> 

            {isPageLoading ? <LoadingAnimation />
                :
                (
                  <>

                        <Tabs
                            id="controlled-tab-example"
                            activeKey={key}
                            onSelect={(k) => setKey(k)}
                            className="mb-3"
                            >
                            
                            {/* MAPS LOCATOR */}
                            <Tab eventKey="mapsLocator" title="Maps Locator">
                                <Container>
                                    <Row>
                                        {/* FORM COLUMN */}
                                        <Col xs={4}>
                                            <Form>
                                                <Form.Group className="mb-3" controlId="formGroupEmail">
                                                    <Form.Label>City Filter</Form.Label>
                                                    <Form.Control onChange={(event) => setCityFilter(event.target.value)} placeholder="Enter city e.g. London" />
                                                </Form.Group>
                                            </Form>
                                            <Button variant="primary" onClick={() => {handleSubmitCity()}}>Submit</Button>
                                        </Col>

                                        {/* MAP COLUMN */}
                                        <Col md="auto">
                                            {isLoaded ? <GoogleMap mapWidth={'55vw'} mapHeight={'60vh'} energySites={mapData} /> : null}
                                        </Col>
                                    </Row>

                                </Container>
                            </Tab>

                            {/* REPORT */}
                            <Tab eventKey="report" title="Report">

                                <Container>
                                    <Row>
                                        <Col>
                                            <Table striped>
                                                <thead>
                                                    <tr>
                                                        {tableHeaders.map((header) => {
                                                        return (
                                                            <th key={header} scope="col">{header}</th>
                                                        )
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.map((energySite) => {
                                                        return (
                                                        <tr key={energySite.key}>
                                                            <td><p><a target="_blank" href={energySite.url}>{energySite.siteName}</a></p></td>
                                                            <td>{energySite.siteId}</td>
                                                            <td>{energySite.energyType}</td>
                                                            <td>{energySite.location}</td>
                                                            <td>{energySite.description}</td>
                                                            <td>{energySite.opDate}</td>
                                                        </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </Table>

                                        </Col>
                                    </Row>
                                </Container>

                            </Tab>

                        </Tabs>

                        

                        
                    



                        

                  </>
                )
            }

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
    // marginTop: "0px",
    // marginLeft: '64px',
    // paddingTop: '0px'
    margin: '64px'
  }
);

export default EnergySites;