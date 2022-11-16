import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import styled from '@emotion/styled';
import { colors, space, type } from "@workday/canvas-kit-react/tokens";
import { LoadingDots } from "@workday/canvas-kit-react/loading-animation";
import { Popper } from "@workday/canvas-kit-react/popup";
import { Toast } from "@workday/canvas-kit-react/toast";
import { exclamationCircleIcon, checkCircleIcon } from '@workday/canvas-system-icons-web';
import { Card } from "@workday/canvas-kit-react/card";

import FormField from "@workday/canvas-kit-react/form-field";
import { Layout } from "@workday/canvas-kit-react/layout";
import TextArea from "@workday/canvas-kit-react/text-area";
import {Select, SelectOption} from '@workday/canvas-kit-react/select';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {Checkbox} from '@workday/canvas-kit-react/checkbox';

import {ActionBar} from '@workday/canvas-kit-react/action-bar';
import {PrimaryButton, SecondaryButton, DeleteButton} from '@workday/canvas-kit-react/button';

import {
    Popup,
    usePopupModel,
    useCloseOnEscape,
    useCloseOnOutsideClick,
    useInitialFocus,
    useReturnFocus,
  } from '@workday/canvas-kit-react/popup';
  import {Box, HStack} from '@workday/canvas-kit-react/layout';

import { 
    getEnergySites,
    getEnergySitesOffset,
    getEnergySite,
    patchEnergySite,
    deleteEnergySite
} from './EnergySitesAppData';

import GoogleMap from '../../common/components/GoogleMap';
import { useLoadScript } from "@react-google-maps/api";

const ENERGY_SITES_APP_ID = process.env.REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES;
const TENANT_ALIAS = process.env.REACT_APP_WCP_DEFAULT_TENANT_ALIAS;

const SiteManager = ({sidePanelOpen}) => {

    const toastsAnchorRef = useRef();
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isPageSubmitDisabled, setIsPageSubmitDisabled] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [energySites, setEnergySites] = useState([]);
    const [mapData, setMapData] = useState([]);

    // delete popup
    const model = usePopupModel();
    useCloseOnOutsideClick(model);
    useCloseOnEscape(model);
    useInitialFocus(model);
    useReturnFocus(model);

    const [confirmUpdate, setConfirmUpdate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleConfirmUpdate = () => {
        setConfirmUpdate(!confirmUpdate)
    }

    const handleConfirmDelete = () => {
        setConfirmDelete(!confirmDelete)
    }

    const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });

    const [name, setName] = useState('');
    const [siteId, setSiteId] = useState('');
    const [energyType, setEnergyType] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [opStatus, setOpStatus] = useState('');
    const [opDate, setOpDate] = useState('');
    const [mainDate, setMainDate] = useState('');
    const [energyOutput, setEnergyOutput] = useState(0);
    const [workdayId, setWorkdayId] = useState('');

    const [selectedSite, setSelectedSite] = useState('');

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

    // on select site
    useEffect(() => {
        // console.log(`CHANGED SITE TO: ${selectedSite}`);
        setIsPageLoading(true);
        handleSelectSite()
        .finally(() => setIsPageLoading(false));
    }, [selectedSite])

    const fetchEnergySites = async() => {
        const energySites = await getEnergySites();
        if (!energySites.data) {
            throw new Error(energySites.error) }

        var total = energySites.total;
        var limit = 100;
        var max = Math.ceil(total/limit);

        const fetchedEnergySites = [];

        for (var offset = 0; offset < max*limit; offset += limit) {
            var response = await getEnergySitesOffset(offset, limit);

            if (!response.data) { 
                throw new Error(energySites.error) }

            response.data.forEach(energySite => {
                fetchedEnergySites.push({
                    key: uuid(),
                    siteName: energySite.siteName ? energySite.siteName : '',
                    siteId: energySite.siteId ? energySite.siteId : '',
                    energyType: energySite.energyType ? energySite.energyType : '',
                    location: energySite.location ? energySite.location : '',
                    description: energySite.description ? energySite.description : '',
                    opDate: energySite.operationalDate ? energySite.operationalDate : '',
                    mainDate: energySite.lastMaintenanceDate ? energySite.lastMaintenanceDate : '',
                    opStatus: energySite.operationalStatus ? energySite.operationalStatus : '',
                    energyOutput: energySite.energyOutput ? energySite.energyOutput : '',
                    workdayId: energySite.id,
                    url: getSiteUpdateUrl(energySite),
                    coordinates: getCoordinates(energySite)
                })
            })
        }

        setEnergySites(fetchedEnergySites);
    }

    const handleSelectSite = async() => {
        const thisSite = energySites.filter(site =>
            site.siteName === selectedSite
        )[0];

        if (!thisSite) { return console.log('Site not found @handleSelectSite')}

        thisSite.coordinates = getCoordinates(thisSite);
        thisSite.url = getSiteUpdateUrl(thisSite);
        
        setName(thisSite.siteName);
        setSiteId(thisSite.siteId);
        setEnergyType(thisSite.energyType);
        setLocation(thisSite.location);
        setDescription(thisSite.description ? thisSite.description : '');
        setOpStatus(thisSite.opStatus ? thisSite.opStatus : '');
        setOpDate(thisSite.opDate ? thisSite.opDate : '');
        setMainDate(thisSite.mainDate ? thisSite.mainDate : '');
        setEnergyOutput(thisSite.energyOutput ? thisSite.energyOutput : 0);
        setWorkdayId(thisSite.workdayId);

        setConfirmUpdate(false)
        setConfirmDelete(false);

        setMapData([thisSite])
    }

    const updateThisSite = async(workdayId) => {
        const payload = {
            siteName: name,
            siteId: siteId,
            energyType: energyType,
            location: location,
            description: description,
            operationalStatus: opStatus,
            operationalDate: opDate,
            lastMaintenanceDate: mainDate,
            energyOutput: parseInt(energyOutput),
        }

        // console.log(payload)

        var thisSite = await patchEnergySite(workdayId, payload);
        if (!thisSite.siteName) {
            if (thisSite.error.includes("Unauthorized")) {
                throw new Error("You have been automatically signed out. Please login.");
            } else {
                throw new Error(thisSite.error);
            }
        }
        
        setToasts([{ key: Date.now(), icon: checkCircleIcon, color: colors.greenApple500, text: `Successfully Updated Site: \n${name}`}]);
        setConfirmUpdate(false);
    }

    const submitUpdateSite = async() => {
        // console.log('Update site clicked')

        if (!confirmUpdate) { return }

        setIsPageLoading(true);
        updateThisSite(workdayId)
          .catch((error) => {
            console.error(error);
            setToasts([{ key: Date.now(), icon: exclamationCircleIcon, color: colors.cinnamon500, text: `Problem Updating Site: ${error.message}` }]);
          })
          .finally(() => setIsPageLoading(false));
    }

    const deleteThisSite = async(workdayId) => {
        var thisSite = await deleteEnergySite(workdayId);
        if (!thisSite.ok) {
            if (thisSite.error.includes("Unauthorized")) {
                throw new Error("You have been automatically signed out. Please login.");
            } else {
                throw new Error(thisSite.error);
            }
        }
        
        setToasts([{ key: Date.now(), icon: checkCircleIcon, color: colors.greenApple500, text: `Successfully Deleted Site: \n${name}`}])
        setConfirmDelete(false);
        await fetchEnergySites();
    }

    const submitDeleteSite = async() => {
        if (!confirmDelete) { return }

        // console.log(workdayId)

        setIsPageLoading(true);
        deleteThisSite(workdayId)
          .catch((error) => {
            console.error(error);
            setToasts([{ key: Date.now(), icon: exclamationCircleIcon, color: colors.cinnamon500, text: `Problem Deleting Site: ${error.message}` }]);
          })
          .finally(() => setIsPageLoading(false));
    }

    const opStatuses = ["Operational", "Non-Operational", "Under Maintenance", "Decomissioned"];
    const energyTypes = ["Solar", "Hydropower", "Geothermal", "Wind","Biomass"];

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
                    <AppTitle>Site Manager</AppTitle>
                    <AppDescription>Use the Site Manager to update and delete new renewable energy sites. CAUTION: records will be updated in Workday.</AppDescription>

                    {/* SITE SELECTOR */}
                    <Layout>
                        <FormField label="Renewable Energy Site" inputId="selectedSite" required={true}
                        labelPosition={FormField.LabelPosition.Left} grow={true}
                        >
                            <Select
                                typeAhead={true}
                                id="selectedSite"
                                value={selectedSite}
                                options={energySites.map((energySite) => { return { key: energySite.workdayId, value: energySite.workdayId, label: energySite.siteName }; })} 
                                onChange={event => setSelectedSite(event.target.value)}>

                                <SelectOption disabled label="Please select an energy site" value="" />
                                
                                {energySites.map((energySite) => {
                                    return <SelectOption label={energySite.siteName} 
                                    value={energySite.siteName}
                                    key={energySite.siteName}
                                    />
                                })}

                            </Select>
                        </FormField>

                    </Layout>

                    {/* CARD & MAP */}
                    <Layout>
                        {/* CARD */}
                        <Layout.Column>
                            {!sidePanelOpen ? 
                            <Card style={{height:'450px'}}>

                                <CardTitle>{selectedSite ? selectedSite : '(none selected)'}</CardTitle>

                                <CardLabel>Site ID</CardLabel>
                                <CardText>{siteId ? siteId : '(empty)'}</CardText>

                                <CardLabel>Energy Type</CardLabel>
                                <CardText>{energyType ? energyType : '(empty)'}</CardText>

                                <CardLabel>Location</CardLabel>
                                <CardText>{location ? location : '(empty)'}</CardText>

                                <CardLabel>Description</CardLabel>
                                <CardText>{description ? description : '(empty)'}</CardText>

                                {/* <CardLabel>Workday ID</CardLabel>
                                <CardText>{workdayId ? workdayId : '(empty)'}</CardText> */}

                                {/* <CardLabel>Op Status</CardLabel>
                                <CardText>{opStatus ? opStatus : '(empty)'}</CardText> */}

                            </Card> 
                            : null}
                            
                        </Layout.Column>

                        {/* MAP */}
                        <Layout.Column>
                            {isLoaded && !sidePanelOpen ? <GoogleMap mapWidth={'50vw'} mapHeight={'450px'} energySites={mapData} /> : null}
                        </Layout.Column>
                    </Layout>

                    {/* SPACING */}
                    <div style={{minHeight:'25px'}}></div>

                    {/* FORM */}
                    <Layout>
                        {/* COL 1 */}
                        <Layout.Column>
                            {/* SITE NAME */}
                            <FormField label="Site Name" required={true}>
                                <TextInput value={name} onChange={event => setName(event.target.value)} disabled={true} placeholder={'Solar Site #123-AB'}/>
                            </FormField>

                            {/* SITE ID */}
                            <FormField label="Site ID" required={true}>
                                <TextInput value={siteId} onChange={event => setSiteId(event.target.value)} disabled={true} placeholder={'SOLYYYYMMDDHHMMSS'}/>
                            </FormField>

                            {/* ENERGY TYPE */}
                            <FormField label="Energy Type" 
                            inputId="energyType" 
                            required={true}
                            disabled={true}>
                                <Select
                                    id="energyType"
                                    name="energyType"
                                    value={energyType}
                                    onChange={event => setEnergyType(event.target.value)}
                                    disabled={false}>

                                    <SelectOption disabled label="Please select an energy type" value="" />

                                    {energyTypes.map((energyType) => {
                                        return <SelectOption label={energyType} 
                                        value={energyType}
                                        key={energyType}
                                        />
                                    })}                 
                                </Select>
                            </FormField>

                            {/* LOCATION */}
                            <FormField label="Location" required={true} grow={true}>
                                <TextArea value={location} onChange={event => setLocation(event.target.value)} disabled={true} placeholder={'Address Line 1, City, Country'}/>
                            </FormField>

                            {/* DESCRIPTION */}
                            <FormField label="Description" required={false} grow={true}>
                                <TextArea value={description} onChange={event => setDescription(event.target.value)} disabled={false} placeholder={'...Coordinates:latitude,longitude'}/>
                            </FormField>
                        </Layout.Column>

                        {/* COL 2 */}
                        <Layout.Column width={'50vw'}>
                            {/* OP STATUS */}
                            <FormField label="Operational Status" inputId="opStatus" required={false}>
                                <Select
                                    id="opStatus"
                                    name="opStatus"
                                    value={opStatus}
                                    onChange={event => setOpStatus(event.target.value)}>

                                    <SelectOption disabled label="Please select an operational status" value="" />

                                    {opStatuses.map((opStatus) => {
                                        return <SelectOption label={opStatus} 
                                        value={opStatus}
                                        key={opStatus}
                                        />
                                    })}   

                                </Select>
                            </FormField>

                            {/* OP DATE */}
                            <FormField label="Operational Date" required={false}>
                                <TextInput value={opDate} onChange={event => setOpDate(event.target.value)} disabled={false} placeholder={'YYYY-MM-DD'}/>
                            </FormField>

                            {/* MAIN DATE */}
                            <FormField label="Last Maintenance Date" required={false}>
                                <TextInput value={mainDate} onChange={event => setMainDate(event.target.value)} disabled={false} placeholder={'YYYY-MM-DD'}/>
                            </FormField>

                            {/* ENERGY OUTPUT */}
                            <FormField label="Energy Output - Watts" required={false}>
                                <TextInput value={energyOutput} onChange={event => setEnergyOutput(event.target.value)} disabled={false} placeholder={'10000'}/>
                            </FormField>

                            {/* CHECKBOX */}
                            <Checkbox checked={confirmUpdate} label="Confirm changes" onChange={handleConfirmUpdate} />
                        </Layout.Column>

                    </Layout>

                    {/* ACTION BAR */}
                    <ActionBar>
                        {/* <ActionBar.List position="relative"> */}
                        <ActionBar.List position="fixed">
                            <ActionBar.Item as={SecondaryButton} onClick={submitUpdateSite}>
                                Update
                            </ActionBar.Item>
                            <Popup model={model}>
                                <Popup.Target as={DeleteButton}>Delete</Popup.Target>
                                <Popup.Popper placement="bottom">
                                    <Popup.Card width={400}>
                                    <Popup.CloseIcon aria-label="Close" />
                                    <Popup.Heading>Delete Site</Popup.Heading>
                                    <Popup.Body>
                                        <Box as="p" marginY="zero">
                                            <Checkbox checked={confirmDelete} label={`Are you sure you'd like to delete ${name}?`} onChange={handleConfirmDelete} />
                                        </Box>
                                    </Popup.Body>
                                    <HStack spacing="s" padding="xxs" marginTop="xxs">
                                        <Popup.CloseButton as={DeleteButton} onClick={submitDeleteSite}>
                                        Delete
                                        </Popup.CloseButton>
                                        <Popup.CloseButton>Cancel</Popup.CloseButton>
                                    </HStack>
                                    </Popup.Card>
                                </Popup.Popper>
                            </Popup>
                        </ActionBar.List>
                    </ActionBar>

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

const CardTitle = styled('h2') ({
    color: '#333',
    fontWeight: '700',
    marginTop: '0'
})

const CardLabel = styled('h5') ({
    fontSize: "16px",
    lineHeight: "1.5rem",
    letterSpacing: "0.01rem",
    fontWeight: "700",
    color: "rgb(51, 51, 51)",
    marginBottom: '0',
    marginTop: '0'
})

const CardText = styled('h5') ({
    fontSize: "14px",
    lineHeight: "1.25rem",
    letterSpacing: "0.015rem",
    fontWeight: "400",
    color: "rgb(73, 73, 73)",
    marginTop: '0'
})

export default SiteManager