import {AssetUrl} from "../system/asset/asset.system";

export function createLocalAssetUrl(folderPath: string): AssetUrl {
    return process.env.PUBLIC_URL + folderPath;
}