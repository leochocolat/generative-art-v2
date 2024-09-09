// Vendor
import { ToneAudioBuffer } from 'tone';
import { Loader } from 'resource-loader';

class ToneAudioLoader extends Loader {
    /**
     * Public
     */
    load({ path, options = {} }) {
        const promise = new Promise((resolve) => {
            const loader = new ToneAudioBuffer(path, (response) => {
                resolve(response);
            });
        });

        return promise;
    }
}

export default ToneAudioLoader;
