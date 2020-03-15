export default class HTMLHelper {
    static copyToClipboard(text: string) {
        let input = document.createElement('input');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);

        input.value = text;
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(input);
    }
}