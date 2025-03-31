import { Link } from "@tanstack/react-router"
import {
  type LinkProps,
  Link as YamadaLink,
  type LinkProps as YamadaLinkProps,
} from "@yamada-ui/react"
import { type FC, memo } from "react"

interface UILinkProps
  extends Omit<YamadaLinkProps, "href">,
    Omit<LinkProps, keyof YamadaLinkProps> {
  children: React.ReactNode
}

export const UILink: FC<UILinkProps> = memo((props) => {
  return <YamadaLink as={Link} {...props} />
})

UILink.displayName = "UILink"
