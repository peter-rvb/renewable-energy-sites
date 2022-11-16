import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import styled from '@emotion/styled';
import { colors, space, type } from "@workday/canvas-kit-react/tokens";
import { LoadingDots } from "@workday/canvas-kit-react/loading-animation";
import { Popper } from "@workday/canvas-kit-react/popup";
import { Toast } from "@workday/canvas-kit-react/toast";
import { exclamationCircleIcon } from '@workday/canvas-system-icons-web';

import FormField from "@workday/canvas-kit-react/form-field";
import {TextInput} from '@workday/canvas-kit-react/text-input';

import {ActionBar} from '@workday/canvas-kit-react/action-bar';
import {PrimaryButton} from '@workday/canvas-kit-react/button';

import { Layout } from "@workday/canvas-kit-react/layout";
import {Tabs} from '@workday/canvas-kit-react/tabs';

import GoogleMap from '../../common/components/GoogleMap';
import { useLoadScript } from "@react-google-maps/api";

import { getEnergySites, getEnergySitesOffset } from './EnergySitesAppData';

import './WorkdayTable.css';

const ENERGY_SITES_APP_ID = process.env.REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES;
const TENANT_ALIAS = process.env.REACT_APP_WCP_DEFAULT_TENANT_ALIAS;

const SiteLocator = ({sidePanelOpen}) => {

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

    return <>

        <LayoutContainer ref={toastsAnchorRef}>
            <Popper placement="top" open={toasts.length > 0} anchorElement={toastsAnchorRef}>
                {toasts.map((toast) => <Toast key={toast.key} iconColor={toast.color} icon={toast.icon} onClose={() => setToasts(toasts.filter((t) => t.key !== toast.key))}>{toast.text} </Toast>)}
            </Popper>
        </LayoutContainer>
    
        {isPageLoading ? <LoadingAnimation />
            :
            (
                <>
                    <AppTitle>Site Locator</AppTitle>
                    <AppDescription>Use the Site Locator to discover where in the world we are tapping in to renewable energy.</AppDescription>
                    
                    <Tabs>
                        <Tabs.List>
                            <Tabs.Item>Maps Locator</Tabs.Item>
                            <Tabs.Item>Report</Tabs.Item>
                        </Tabs.List>
                        <div style={{marginTop: space.m}}>

                            {/* MAPS LOCATOR */}
                            <Tabs.Panel>
                                <Layout>

                                    {/* CITY FILTER */}
                                    {!sidePanelOpen ? 
                                    <Layout.Column width="40vw">
                                        <FormField label="City Filter" required={true}>
                                            <TextInput value={cityFilter} onChange={event => setCityFilter(event.target.value)} />
                                        </FormField>

                                        <ActionBar fixed={true}>
                                            <PrimaryButton
                                            disabled={isPageLoading || isPageSubmitDisabled}
                                            onClick={() => handleSubmitCity()}>Submit</PrimaryButton>
                                        </ActionBar>

                                        {/* SPACING */}
                                        <div style={{minHeight:'200px'}}></div>
                                        
                                        <h3>Instructions</h3>
                                        <p>Set initial zoom of map by scrolling in and out.</p>
                                    </Layout.Column>

                                    : null}

                                    {/* GOOGLE MAP */}
                                    <Layout.Column width="60vw">
                                        {isLoaded ? <GoogleMap mapWidth={'60vw'} mapHeight={'60vh'} energySites={mapData} /> : null}
                                    </Layout.Column>

                                </Layout>
                
                            </Tabs.Panel>

                            {/* REPORT */}
                            <Tabs.Panel>
                                <Layout>
                                    <Layout.Column>

                                        <div className="wdc-table-meta">
                                            <div className="wdc-table-info">
                                                <span className="wdc-table-name">Renewable Energy Sites</span>
                                                <span className="wdc-table-row-count">{tableData.length} Items</span>
                                            </div>
                                        </div>

                                        <table className="wdc-table">
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
                                                        <td className="wdc-table-cell-left"><p><a target="_blank" href={energySite.url}>{energySite.siteName}</a></p></td>
                                                        <td className="wdc-table-cell-left">{energySite.siteId}</td>
                                                        <td className="wdc-table-cell-left">{energySite.energyType}</td>
                                                        <td className="wdc-table-cell-left">{energySite.location}</td>
                                                        <td className="wdc-table-cell-left">{energySite.description}</td>
                                                        <td className="wdc-table-cell-left">{energySite.opDate}</td>
                                                    </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>

                                        {/* SPACING */}
                                        {/* <div style={{minHeight:'25px'}}></div> */}

                                    </Layout.Column>
                                </Layout>
                            </Tabs.Panel>

                        </div>
                    </Tabs>   
                </>
            )
        }
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
    // paddingBottom: space.xxl
});

const LayoutSectionTitle = styled('h2') ({
    ...type.levels.heading.small
});

const AppTitle = styled('h2') ({
    color: 'rgb(73, 73, 73)',
    fontWeight: '700',
})

const AppDescription = styled('h3') ({
    fontSize: '16px',
    letterSpacing: '0.01rem',
    lineHeight: '1.5rem',
    fontWeight: '500',
    color: 'rgb(73, 73, 73)',
})

export default SiteLocator