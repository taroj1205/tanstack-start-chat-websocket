import { FC, memo } from "react";
import {
  type LinkProps as YamadaLinkProps,
  LinkProps,
  Link as YamadaLink,
} from "@yamada-ui/react";
import { Link } from "@tanstack/react-router";

interface UILinkProps
  extends Omit<YamadaLinkProps, "href">,
    Omit<LinkProps, keyof YamadaLinkProps> {
  children: React.ReactNode;
}

export const UILink: FC<UILinkProps> = memo((props) => {
  return <YamadaLink as={Link} {...props} />;
});

UILink.displayName = "UILink";
