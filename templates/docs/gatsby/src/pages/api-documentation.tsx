import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Documentation } from '@open-rpc/docs-react';
import './api-documentation.css';
import { Container, Tab, Tabs, IconButton, Tooltip, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import PlaygroundSplitPane from '../components/PlaygroundSplitPane';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { useTheme } from '@mui/material/styles';
import { lightTheme as reactJsonLightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme as reactJsonDarkTheme } from '@uiw/react-json-view/vscode';
import { OpenrpcDocument } from '@open-rpc/meta-schema';

const ApiDocumentationContent: React.FC = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const currentTheme = useTheme();
  const [horizontalSplit, setHorizontalSplit] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any


  useEffect(() => {
    const t = currentTheme.palette.mode === 'dark' ? 'vs-dark' : 'vs';
    setReactJsonOptions({
      ...reactJsonOptions,
      style: currentTheme.palette.mode === 'dark' ? reactJsonDarkTheme : reactJsonLightTheme,
    });
  }, [currentTheme]);

  const [reactJsonOptions, setReactJsonOptions] = useState({
    style: reactJsonDarkTheme,
    shortenTextAfterLength: 25,
    displayDataTypes: false,
    displayObjectSize: false,
    indentWidth: 2,
  });

  const openrpcQueryData = useStaticQuery(graphql`
    query {
      openrpcDocument {
        id
        openrpcDocument
      }
    }
  `);

  const [openrpcDocument, setOpenrpcDocument] = useState<OpenrpcDocument>();

  useEffect(() => {
    if (openrpcQueryData.openrpcDocument) {
      try {
        // First parse the string to JSON
        const parsedJson = JSON.parse(openrpcQueryData.openrpcDocument.openrpcDocument);
        // Then dereference it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ($RefParser.dereference(parsedJson) as any)
          .then(setOpenrpcDocument)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: any) => {
            console.error('Error dereferencing schema:', err);
            // Fallback to using the non-dereferenced schema
            setOpenrpcDocument(parsedJson);
          });
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    }
  }, [openrpcQueryData]);

  return (
    <PlaygroundSplitPane
      editorComponent={<></>}
      documentationComponent={
        <Container>
          <Documentation
            reactJsonOptions={reactJsonOptions}
            uiSchema={{
              params: {
                'ui:defaultExpanded': false,
              },
              extensions: {
                'ui:hidden': true,
              },
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema={openrpcDocument || ({} as any)}
          />
          <div style={{ marginBottom: '20px' }} />
        </Container>
      }
    />
  );
};

const ApiDocumentation: React.FC = () => {
  if (typeof window === 'undefined') {
    return (
      <>
        <Typography variant="h1">API Documentation</Typography>
        <Typography>Loading documentation...</Typography>
      </>
    );
  }

  return <ApiDocumentationContent />;
};

export default ApiDocumentation;
