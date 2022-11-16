import { executeRequest, HttpMethod } from '../../common/wcp/WcpRequest';

const ENERGY_SITES_APP_ID = process.env.REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES;

export const getEnergySites = async() => {
    return executeRequest(HttpMethod.GET, `apps/${ENERGY_SITES_APP_ID}/v1/energySites`);
}

export const getEnergySitesOffset = async(offset, limit) => {
    return executeRequest(HttpMethod.GET, `apps/${ENERGY_SITES_APP_ID}/v1/energySites?offset=${offset}&limit=${limit}`);
}