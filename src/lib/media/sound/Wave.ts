import ByteArray from "../../util/ByteArray";

export default class Wave {
    static arrayToWaveFile(wave: number[]): ByteArray {
        if (!wave) {
            return;
        }
        if (!wave.length) {
            return;
        }

        const NCH = 1;     // number of channels
        const SPS = 44100; // samples per second
        const BPS = 1;     // bytes per sample
        const DUR = wave.length / SPS;     // duration in seconds
        const size = Math.round(DUR * NCH * SPS * BPS);

        const waveFile = new ByteArray(size + 44, "little");
        waveFile.putChars("RIFF");
        waveFile.putUInt32(44 + size);
        waveFile.putChars("WAVEfmt ");
        waveFile.putUInt32(16);

        waveFile.putUInt16(1); // wFormatTag
        waveFile.putUInt16(NCH); // nChannels
        waveFile.putUInt32(SPS); // nSamplesPerSec
        waveFile.putUInt32(NCH * BPS * SPS); // nAvgBytesPerSec
        waveFile.putUInt16(NCH * BPS); // nBlockAlign
        waveFile.putUInt16(BPS * 8); // wBitsPerSample
        waveFile.putChars("data");
        waveFile.putUInt32(size);

        for (let i = 0; i < wave.length; i++) {
            if (wave[i] > 1) {
                wave[i] = 1;
            }
            if (wave[i] < -1) {
                wave[i] = -1;
            }

            waveFile.putUInt8(Math.floor((1 + wave[i]) / 2 * 255));
        }

        return waveFile;
    }

    static byteArrayToAudio(waveFile: ByteArray): HTMLAudioElement {
        const blob = new Blob([waveFile.buffer], {type: "Audio/WAV"});
        const url = URL.createObjectURL(blob);
        return new Audio(url);
    }
}