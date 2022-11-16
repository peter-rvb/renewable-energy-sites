import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { colors, space, type } from "@workday/canvas-kit-react/tokens";
import { LoadingDots } from "@workday/canvas-kit-react/loading-animation";
import { Popper } from "@workday/canvas-kit-react/popup";
import { Toast } from "@workday/canvas-kit-react/toast";
import { exclamationCircleIcon, checkCircleIcon } from '@workday/canvas-system-icons-web';

import FormField from "@workday/canvas-kit-react/form-field";
import { Layout } from "@workday/canvas-kit-react/layout";
import TextArea from "@workday/canvas-kit-react/text-area";
import {TextInput} from '@workday/canvas-kit-react/text-input';
import Select from "@workday/canvas-kit-preview-react/select";

import {ActionBar} from '@workday/canvas-kit-react/action-bar';
import {PrimaryButton} from '@workday/canvas-kit-react/button';

import { postEnergySite } from './EnergySitesAppData';

const ENERGY_SITES_APP_ID = process.env.REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES;
const TENANT_ALIAS = process.env.REACT_APP_WCP_DEFAULT_TENANT_ALIAS;

const SiteCreator = ({sidePanelOpen}) => {

    const toastsAnchorRef = useRef();
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isPageSubmitDisabled, setIsPageSubmitDisabled] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [name, setName] = useState('');
    const [siteId, setSiteId] = useState('');
    const [energyType, setEnergyType] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [opStatus, setOpStatus] = useState('');
    const [opDate, setOpDate] = useState('');
    const [mainDate, setMainDate] = useState('');
    const [energyOutput, setEnergyOutput] = useState(0);

    const opStatuses = ["Operational", "Non-Operational", "Under Maintenance", "Decomissioned"];
    const energyTypes = ["Solar", "Hydropower", "Geothermal", 'Wind', "Biomass"];

    const resetForm = () => {
        setName('');
        setSiteId('');
        setEnergyType('');
        setLocation('');
        setDescription('');
        setOpStatus('');
        setOpDate('');
        setMainDate('');
        setEnergyOutput(0)
    }

    const createThisSite = async() => {
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

        var thisSite = await postEnergySite(payload);
        if (!thisSite.siteName) {
            if (thisSite.error.includes("Unauthorized")) {
                throw new Error("You have been automatically signed out. Please login.");
            } else {
                throw new Error(thisSite.error);
            }
        }
        
        setToasts([{ key: Date.now(), icon: checkCircleIcon, color: colors.greenApple500, text: `Successfully Created Site: \n${name}`}]);
        resetForm();
    }

    const submitCreateSite = async() => {
        if (name === '' || siteId === '' || location === '' ) { return console.log('Incomplete form @create')}

        setIsPageLoading(true);
        createThisSite()
          .catch((error) => {
            console.error(error);
            setToasts([{ key: Date.now(), icon: exclamationCircleIcon, color: colors.cinnamon500, text: `Problem Creating Site: ${error.message}` }]);
          })
          .finally(() => setIsPageLoading(false));
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
                    <AppTitle>Site Creator</AppTitle>
                    <AppDescription>Use the Site Creator to create new renewable energy sites. CAUTION: records will be updated in Workday.</AppDescription>

                    <Layout>

                        <Layout.Column>
                            {/* SITE NAME */}
                            <FormField label="Site Name" required={true}>
                                <TextInput value={name} onChange={event => setName(event.target.value)} disabled={false} placeholder={'Solar Site #123-AB'}/>
                            </FormField>

                            {/* SITE ID */}
                            <FormField label="Site ID" required={true}>
                                <TextInput value={siteId} onChange={event => setSiteId(event.target.value)} disabled={false} placeholder={'SOLYYYYMMDDHHMMSS'}/>
                            </FormField>

                            {/* ENERGY TYPE */}
                            <FormField label="Energy Type" inputId="energyType" required={true}>
                            <Select
                                id="energyType"
                                name="energyType"
                                value={energyType}
                                onChange={event => setEnergyType(event.target.value)}
                                options={energyTypes.map((energyType) => { return { key: energyType, value: energyType, label: energyType }; })} />
                            </FormField>

                            {/* LOCATION */}
                            <FormField label="Location" required={true} grow={true}>
                                <TextArea value={location} onChange={event => setLocation(event.target.value)} disabled={false} placeholder={'Address Line 1, City, Country'}/>
                            </FormField>

                            {/* DESCRIPTION */}
                            <FormField label="Description" required={false} grow={true}>
                                <TextArea value={description} onChange={event => setDescription(event.target.value)} disabled={false} placeholder={'...Coordinates:latitude,longitude'}/>
                            </FormField>
                        </Layout.Column>

                        <Layout.Column>
                            {/* OP STATUS */}
                            <FormField label="Operational Status" inputId="opStatus" required={false}>
                            <Select
                                id="opStatus"
                                name="opStatus"
                                value={opStatus}
                                onChange={event => setOpStatus(event.target.value)}
                                options={opStatuses.map((opStatus) => { return { key: opStatus, value: opStatus, label: opStatus }; })} />
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
                            
                        </Layout.Column>

                    </Layout>

                    <ActionBar>
                        {/* <ActionBar.List position="relative"> */}
                        <ActionBar.List position="fixed">
                            <ActionBar.Item as={PrimaryButton} onClick={() => submitCreateSite()}>
                                Create Site
                            </ActionBar.Item>
                            <ActionBar.Item onClick={() => resetForm()}> 
                                Reset Form
                            </ActionBar.Item>
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

export default SiteCreator