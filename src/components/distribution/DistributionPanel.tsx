import { useState } from 'react';
import {
  Grid, Column, Tabs, TabList, Tab, TabPanels, TabPanel,
  Button, TextInput, TextArea, Tag, Tile, Stack, InlineLoading,
  Select, SelectItem, ComposedModal, ModalHeader, ModalBody, ModalFooter,
  ToastNotification, CodeSnippet,
} from '@carbon/react';
import { Copy, Link as LinkIcon } from '@carbon/icons-react';
import DOMPurify from 'dompurify';
import {
  useQRCode, useEmbedCode, useEmailLists,
  useCreateEmailList, useSendSurveyEmails,
} from '@/hooks/useDistribution';
import { Loading } from '@/components/shared/Loading';

// DOMPurify config that only allows safe SVG elements
const SVG_PURIFY_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g', 'text', 'tspan', 'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'stop', 'pattern', 'image', 'title', 'desc'],
  ALLOWED_ATTR: ['viewBox', 'width', 'height', 'xmlns', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width', 'transform', 'opacity', 'id', 'class', 'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'clip-path', 'href', 'xlink:href', 'preserveAspectRatio', 'points', 'font-size', 'font-family', 'text-anchor', 'dominant-baseline', 'alignment-baseline'],
};

interface DistributionPanelProps {
  surveyId: string;
  surveyTitle: string;
}

export function DistributionPanel({ surveyId, surveyTitle }: DistributionPanelProps) {
  const publicUrl = `${window.location.origin}/s/${surveyId}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="distribution-panel">
      <div className="distribution-panel__header">
        <h3 className="text-lg font-semibold text-neutral-900">Distribute Survey</h3>
        <Tag type="blue">{surveyTitle}</Tag>
      </div>

      <Tabs>
        <TabList aria-label="Distribution options">
          <Tab>Web Link</Tab>
          <Tab>QR Code</Tab>
          <Tab>Embed</Tab>
          <Tab>Email</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <WebLinkTab publicUrl={publicUrl} copyToClipboard={copyToClipboard} />
          </TabPanel>
          <TabPanel>
            <QRCodeTab surveyId={surveyId} />
          </TabPanel>
          <TabPanel>
            <EmbedTab surveyId={surveyId} copyToClipboard={copyToClipboard} />
          </TabPanel>
          <TabPanel>
            <EmailTab surveyId={surveyId} surveyTitle={surveyTitle} publicUrl={publicUrl} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

// -- Web Link Tab --

function WebLinkTab({ publicUrl, copyToClipboard }: { publicUrl: string; copyToClipboard: (text: string) => Promise<void> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="distribution-tab">
      <Stack gap={6}>
        <p>Share this link to collect responses. Anyone with the link can respond.</p>

        <Tile className="distribution-link-tile">
          <div className="distribution-link-tile__row">
            <TextInput
              id="public-link"
              labelText=""
              value={publicUrl}
              readOnly
              size="lg"
            />
            <Button
              kind="primary"
              renderIcon={copied ? LinkIcon : Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </Tile>

        <div className="distribution-tips">
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">Tips</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
            <li>Share via social media, messaging apps, or email</li>
            <li>Post on your website or blog</li>
            <li>Include in newsletters or announcements</li>
          </ul>
        </div>
      </Stack>
    </div>
  );
}

// -- QR Code Tab --

function QRCodeTab({ surveyId }: { surveyId: string }) {
  const { data, isLoading, error } = useQRCode(surveyId);

  if (isLoading) return <Loading />;
  if (error) return <p>Failed to load QR code</p>;

  const handleDownload = () => {
    if (!data?.svg) return;
    const blob = new Blob([data.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-${surveyId}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="distribution-tab">
      <Stack gap={6}>
        <p>Scan this QR code to open the survey on a mobile device.</p>

        <div className="distribution-qr">
          {data?.pngUrl ? (
            <img src={data.pngUrl} alt="Survey QR Code" className="distribution-qr__code" />
          ) : data?.svg ? (
            <div
              className="distribution-qr__code"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.svg, SVG_PURIFY_CONFIG) }}
            />
          ) : null}
        </div>

        <div className="distribution-qr__actions">
          <Button kind="secondary" onClick={handleDownload}>
            Download SVG
          </Button>
        </div>
      </Stack>
    </div>
  );
}

// -- Embed Tab --

function EmbedTab({ surveyId }: { surveyId: string; copyToClipboard: (text: string) => Promise<void> }) {
  const [mode, setMode] = useState<'popup' | 'embedded' | 'fullpage'>('popup');
  const { data, isLoading } = useEmbedCode(surveyId, mode);

  if (isLoading) return <Loading />;

  const fullCode = data ? `${data.html}\n\n<script>\n${data.js}\n</script>` : '';

  return (
    <div className="distribution-tab">
      <Stack gap={6}>
        <p>Embed the survey on your website or app.</p>

        <Select
          id="embed-mode"
          labelText="Display Mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
        >
          <SelectItem value="popup" text="Popup - Button opens survey in popup" />
          <SelectItem value="embedded" text="Embedded - Survey appears inline" />
          <SelectItem value="fullpage" text="Full Page - Survey fills container" />
        </Select>

        <CodeSnippet type="multi" feedback="Copied!">
          {fullCode}
        </CodeSnippet>

        <div className="distribution-tips">
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">How to use</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
            <li>Copy the embed code above</li>
            <li>Paste it into your website HTML</li>
            <li>The survey will appear based on the selected mode</li>
          </ul>
        </div>
      </Stack>
    </div>
  );
}

// -- Email Tab --

function EmailTab({ surveyId, surveyTitle, publicUrl }: { surveyId: string; surveyTitle: string; publicUrl: string }) {
  const { data: emailLists, isLoading: listsLoading } = useEmailLists();
  const createEmailList = useCreateEmailList();
  const sendEmails = useSendSurveyEmails();

  const [selectedList, setSelectedList] = useState('');
  const [subject, setSubject] = useState(`You're invited to take: ${surveyTitle}`);
  const [body, setBody] = useState(`Hi,\n\nWe'd love to hear your feedback! Please take a moment to complete our survey:\n\n${publicUrl}\n\nThank you!`);
  const [scheduleAt, setScheduleAt] = useState('');
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListContacts, setNewListContacts] = useState('');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const handleCreateList = async () => {
    if (!newListName.trim() || !newListContacts.trim()) return;

    const contacts = newListContacts
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('@'))
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { email: parts[0], firstName: parts[1], lastName: parts[2] };
      });

    try {
      await createEmailList.mutateAsync({ name: newListName, contacts });
      setToast({ kind: 'success', message: 'Email list created' });
      setShowCreateList(false);
      setNewListName('');
      setNewListContacts('');
    } catch {
      setToast({ kind: 'error', message: 'Failed to create email list' });
    }
  };

  const handleSendEmails = async () => {
    if (!selectedList || !subject.trim() || !body.trim()) return;

    try {
      await sendEmails.mutateAsync({
        surveyId,
        listId: selectedList,
        subject,
        body,
        scheduleAt: scheduleAt || undefined,
      });
      setToast({ kind: 'success', message: 'Emails sent successfully' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to send emails' });
    }
  };

  if (listsLoading) return <Loading />;

  return (
    <div className="distribution-tab">
      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Stack gap={6}>
        <p>Send survey invitations via email to your contact lists.</p>

        <Grid>
          <Column sm={4} md={8} lg={8}>
            <Stack gap={5}>
              <Select
                id="email-list"
                labelText="Select Email List"
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
              >
                <SelectItem value="" text="Choose a list..." />
                {emailLists?.map((list) => (
                  <SelectItem key={list.id} value={list.id} text={`${list.name} (${list.contactCount} contacts)`} />
                ))}
              </Select>

              <Button kind="ghost" onClick={() => setShowCreateList(true)}>
                + Create New List
              </Button>

              <TextInput
                id="email-subject"
                labelText="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <TextArea
                id="email-body"
                labelText="Message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                helperText="Use {link} to insert the survey URL"
              />

              <TextInput
                id="schedule-at"
                labelText="Schedule (optional)"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                helperText="Leave empty to send immediately"
              />

              <Button
                kind="primary"
                onClick={handleSendEmails}
                disabled={!selectedList || !subject.trim() || !body.trim() || sendEmails.isPending}
              >
                {sendEmails.isPending ? <InlineLoading description="Sending..." /> : 'Send Emails'}
              </Button>
            </Stack>
          </Column>
        </Grid>
      </Stack>

      {/* Create List Modal */}
      <ComposedModal open={showCreateList} onClose={() => setShowCreateList(false)}>
        <ModalHeader title="Create Email List" />
        <ModalBody>
          <Stack gap={5}>
            <TextInput
              id="new-list-name"
              labelText="List Name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., Newsletter Subscribers"
            />
            <TextArea
              id="new-list-contacts"
              labelText="Contacts (one per line)"
              value={newListContacts}
              onChange={(e) => setNewListContacts(e.target.value)}
              placeholder="email@example.com, John, Doe&#10;another@example.com, Jane"
              rows={6}
              helperText="Format: email, firstName, lastName"
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowCreateList(false)}>Cancel</Button>
          <Button
            kind="primary"
            onClick={handleCreateList}
            disabled={!newListName.trim() || !newListContacts.trim() || createEmailList.isPending}
          >
            {createEmailList.isPending ? <InlineLoading description="Creating..." /> : 'Create List'}
          </Button>
        </ModalFooter>
      </ComposedModal>
    </div>
  );
}
