import { Link, LinkProps } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';

interface ExternalLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
}

export function ExternalLink({ href, ...props }: ExternalLinkProps) {
  return (
    <Link
      target="_blank"
      {...props}
      href={href as any}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
