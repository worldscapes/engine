import {SystemDescription, SystemInstance} from "../system";
import {AssetSystem, AssetSystemImpl} from "../asset/asset.system";
import {EngineSystem, EngineSystemImpl} from "../engine/engine.system";
import {Engine, Sound} from "babylonjs";
import {Resolver} from "../../shared/resolver";

export class AudioSystemConfig {
    globalVolume: number = 1;
    ambientSilenceTime: number = 5 * 60 * 1000;
}

export class AudioSystemImpl extends SystemInstance<AudioSystemImpl, AudioSystemConfig> {

    currentAmbientTimeout?: NodeJS.Timeout;
    currentPlayedAmbient?: Sound;

    protected ambientTracks: {
        playedThisRow: boolean,
        sound: Sound,
    }[] = [];

    assetSystem!: AssetSystemImpl;
    engineSystem!: EngineSystemImpl;

    protected async initialize() {
        if (Engine.audioEngine) {
            Engine.audioEngine.useCustomUnlockedButton = true;
        }
        this.assetSystem = this.provider.getInjectedSystem(AssetSystem);
        this.engineSystem = this.provider.getInjectedSystem(EngineSystem);
        this.start();
    }

    start() {
        Engine.audioEngine?.unlock();
        if (Engine.audioEngine?.unlocked) {
            this.startAmbient();
        }
    }

    setAmbientTracks(trackNames: string[])  {
        this.ambientTracks = trackNames.map(name => {
            const soundAsset = this.assetSystem.getSoundAsset(name);
            soundAsset.setVolume(this.provider.getInjectConfig().globalVolume);
            return {
                playedThisRow: false,
                sound: soundAsset,
            };
        });
        this.startAmbient();
    }

    playSound(name: string) {
        const soundAsset = this.assetSystem.getSoundAsset(name);
        soundAsset.setVolume(this.provider.getInjectConfig().globalVolume);
        soundAsset.play();
    }

    startAmbient() {
        if (!this.ambientTracks || this.ambientTracks.length === 0) {
            return;
        }

        this.currentAmbientTimeout = setTimeout(
            async () => {
                let playedTracksCount = 0;
                while (playedTracksCount < this.ambientTracks.length) {
                    let waitingBeforeNextTrack = false;
                    while (!waitingBeforeNextTrack) {
                        const randomIndex = Math.floor(Math.random() * (this.ambientTracks.length));
                        const track = this.ambientTracks[randomIndex];
                        console.log(randomIndex);
                        if (!track.playedThisRow) {
                            waitingBeforeNextTrack = true;
                            await this.playAmbientTrack(track.sound);
                            playedTracksCount += 1;
                            console.log("One track finished")
                        }
                    }
                    await this.createPause(this.provider.getInjectConfig().ambientSilenceTime);
                    waitingBeforeNextTrack = false;
                }
                console.log('All tracks finished');
            },
            0
        );
    }

    protected playAmbientTrack(track: Sound): Promise<void> {
        if (this.currentPlayedAmbient) {
            this.currentPlayedAmbient.stop()
        }

        const onEndedResolver = new Resolver<void>();

        this.currentPlayedAmbient = track;
        this.currentPlayedAmbient.play();
        this.currentPlayedAmbient.onended = () => {
          onEndedResolver.resolve();
          this.currentPlayedAmbient = undefined;
        };

        return onEndedResolver.promise;
    }

    protected createPause(length: number): Promise<void> {
        const pauseResolver = new Resolver<void>();

        setTimeout(() => pauseResolver.resolve(), length)

        return pauseResolver.promise;
    }
}

export const AudioSystem = new SystemDescription(
    AudioSystemConfig,
    AudioSystemImpl,
    [
        AssetSystem,
        EngineSystem
    ],
);