export class UtilClass {
    static parseEmailList(emailsString: string): string[] {
        return emailsString.split(';').map((e: string) => e.replace(/\s+/g, '').trim());
    }
}