import {AssetUrl} from "../../system/asset/asset.system";

/**
 * @description Creates url that leads to resources relative to local **'/public'** folder
 */
export function createLocalAssetUrl(folderPath: string): AssetUrl {
    return process.env.PUBLIC_URL + folderPath;
}