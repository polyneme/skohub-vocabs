/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import { Global, css } from "@emotion/react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, withPrefix } from "gatsby"

import { useConfig } from "../hooks/config"

import Header from "./header"
import Footer from "./footer"

const Layout = ({ children, languages, language }) => {
  const { colors, fonts } = useConfig()
  const style = css`
    height: 100vh;
    display: flex;
    flex-direction: column;

    main {
      flex: 1;
      overflow: auto;
      padding: 20px;

      @media only screen and (max-width: 1024px) {
        overflow: visible;
      }
    }

    .centerPage {
      max-width: 1200px;
      margin: 0 auto;
    }

    .forkMe {
      position: fixed;
      background-color: ${colors.skoHubDarkColor};
      color: ${colors.skoHubWhite};
      padding: 0 60px;
      height: 40px;
      transform: rotate(45deg);
      font-size: 14px;
      line-height: 40px;
      font-weight: 700;
      bottom: 60px;
      left: -60px;
      box-shadow: 0 10px 20px ${colors.skoHubBlackColor};
    }
  `
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <div className="wrapper" css={style}>
      <Global
        // prettier-ignore
        styles={css`
          /* ubuntu-regular - latin */
          @font-face {
            font-family: ${fonts.regular.font_family};
            font-style: ${fonts.regular.font_style};
            font-weight: ${fonts.regular.font_weight};
            src: 
              url(${withPrefix("/fonts/" + fonts.regular.name + ".woff2")}) format("woff2"),
              url(${withPrefix("/fonts/" + fonts.regular.name + ".woff")}) format("woff"),
              url(${withPrefix("/fonts/" + fonts.regular.name + ".ttf")}) format("truetype");
          }

          /* ubuntu-700 - latin */
          @font-face {
            font-family: ${fonts.bold.font_family};
            font-style: ${fonts.bold.font_style};
            font-weight: ${fonts.bold.font_weight};
            src: 
              url(${withPrefix("/fonts/" + fonts.bold.name + ".woff2")}) format("woff2"),
              url(${withPrefix("/fonts/" + fonts.bold.name + ".woff")}) format("woff"),
              url(${withPrefix("/fonts/" + fonts.bold.name + ".ttf")}) format("truetype");
          }

          html {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
          }

          *,
          *:before,
          *:after {
            -webkit-box-sizing: inherit;
            -moz-box-sizing: inherit;
            box-sizing: inherit;
          }

          * {
            -webkit-transition: all 0.5s ease;
            -moz-transition: all 0.5s ease;
            transition: all 0.5s ease;
          }

          html,
          body {
            height: 100%; /* needed for proper layout */
          }

          body {
            padding: 0;
            margin: 0;
            border: 0 none;
            overflow: hidden;
            background-color: ${colors.skoHubWhite};
            font-family: ${fonts.regular.font_family}, ${fonts.bold.font_family}, sans-serif;
            font-weight: 400;
            word-wrap: break-word;
            font-size: 16px;
            line-height: 20px;
            color: ${colors.skoHubDarkColor};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;

            @media only screen and (max-width: 1024px) {
              overflow: auto;
            }
          }

          li > ul {
            margin-left: 1.45rem;
            margin-bottom: calc(1.45rem / 2);
            margin-top: calc(1.45rem / 2);
          }

          li {
            margin-bottom: calc(1.45rem / 2);
          }

          a {
            text-decoration: none;
            color: ${colors.skoHubDarkColor};

            &:hover {
              color: ${colors.skoHubAction};
            }
          }

          .inputStyle {
            background-color: ${colors.skoHubWhite};
            cursor: pointer;
            border: 1px solid ${colors.skoHubDarkGrey};
            border-radius: 30px;
            color: ${colors.skoHubDarkColor};

            &:hover,
            &:focus {
              background-color: ${colors.skoHubLightGrey};
            }

            &[type="button"] {
              background: ${colors.skoHubLightGrey};
              border: 1px solid ${colors.skoHubLightGrey};
              font-weight: 700;

              &:hover {
                background: ${colors.skoHubMiddleColor};
                border: 1px solid ${colors.skoHubMiddleColor};
                color: ${colors.skoHubWhite};
              }
            }
          }
        `}
      />
      <Header
        siteTitle={data.site.siteMetadata.title}
        languages={languages}
        language={language}
      />
      <main>{children}</main>

      <Footer
        siteTitle={data.site.siteMetadata.title}
        languages={languages}
        language={language}
      />
    </div>
  )
}
Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
