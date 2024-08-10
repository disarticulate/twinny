import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField
} from '@vscode/webview-ui-toolkit/react'

import { EVENT_NAME, EXTENSION_CONTEXT_NAME } from '../common/constants'
import { ClientMessage } from '../common/types'
import { useGlobalContext, useProviders } from './hooks'
import styles from './index.module.css'
import { FormEvent } from 'react'
import { TextFieldType } from '@vscode/webview-ui-toolkit'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const global = globalThis as any
export const EmbeddingOptions = () => {
  const {
    embeddingProvider,
    getProvidersByType,
    providers,
    setActiveEmbeddingsProvider
  } = useProviders()

  const { context: rerankThreshold = 0.5, setContext: setRerankThreshold } =
    useGlobalContext<number>(EXTENSION_CONTEXT_NAME.twinnyRerankThreshold)

  const { context: maxChunkSize = '500', setContext: setMaxChunkSize } =
    useGlobalContext<string>(EXTENSION_CONTEXT_NAME.twinnyMaxChunkSize)

  const { context: minChunkSize = '50', setContext: setMinChunkSize } =
    useGlobalContext<string>(EXTENSION_CONTEXT_NAME.twinnyMinChunkSize)

  const { context: overlap = '20', setContext: setOverlap } =
    useGlobalContext<string>(EXTENSION_CONTEXT_NAME.twinnyOverlapSize)

  const embeddingProviders = Object.values(getProvidersByType('embedding'))

  const handleEmbedDocuments = () => {
    global.vscode.postMessage({
      type: EVENT_NAME.twinnyEmbedDocuments
    } as ClientMessage<string[]>)
  }

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setRerankThreshold(value)
  }

  const handleMaxChunkSizeChange = (e: Event | FormEvent<HTMLElement>) => {
    const event = e as unknown as React.ChangeEvent<HTMLInputElement>
    const { value } = event.target
    setMaxChunkSize(value)
  }

  const handleMinChunkSizeChange = (e: Event | FormEvent<HTMLElement>) => {
    const event = e as unknown as React.ChangeEvent<HTMLInputElement>
    const { value } = event.target
    setMinChunkSize(value)
  }

  const handleOverlapSizeChange = (e: Event | FormEvent<HTMLElement>) => {
    const event = e as unknown as React.ChangeEvent<HTMLInputElement>
    const { value } = event.target
    setOverlap(value)
  }

  const handleChangeEmbeddingProvider = (e: unknown): void => {
    const event = e as React.ChangeEvent<HTMLSelectElement>
    const value = event.target.value
    const provider = providers[value]
    setActiveEmbeddingsProvider(provider)
  }

  if (!embeddingProviders) {
    return (
      <div className={styles.embeddingOptions}>
        <p>
          No providers found for type: 'embedding', please add an embedding
          provider...
        </p>
      </div>
    )
  }

  return (
    <div className={styles.embeddingOptions}>
      <div>
        <div>Embedding provider</div>
        <VSCodeDropdown
          value={embeddingProvider?.id}
          name="provider"
          onChange={handleChangeEmbeddingProvider}
        >
          {embeddingProviders
            .sort((a, b) => a.modelName.localeCompare(b.modelName))
            .map((provider, index) => (
              <VSCodeOption key={index} value={provider.id}>
                {`${provider.label} (${provider.modelName})`}
              </VSCodeOption>
            ))}
        </VSCodeDropdown>
      </div>
      <div>
        <div>Max chunk size</div>
        <VSCodeTextField
          type={TextFieldType.text}
          value={maxChunkSize}
          name="provider"
          onChange={(e) => handleMaxChunkSizeChange(e)}
        />
      </div>
      <div>
        <div>Min chunk size</div>
        <VSCodeTextField
          value={minChunkSize}
          name="provider"
          onChange={(e) => handleMinChunkSizeChange(e)}
        />
      </div>
      <div>
        <div>Overlap</div>
        <VSCodeTextField
          value={overlap}
          name="provider"
          onChange={(e) => handleOverlapSizeChange(e)}
        />
      </div>
      <div>
        <VSCodeButton
          onClick={handleEmbedDocuments}
          className={styles.embedDocumentsButton}
        >
          Embed workspace documents
        </VSCodeButton>
      </div>
      <VSCodeDivider />
      <div>
        <div>
          <label htmlFor="threshold">
            Rerank probability threshold ({rerankThreshold})
          </label>
        </div>
        <input
          className={styles.slider}
          type="range"
          onChange={handleThresholdChange}
          id="threshold"
          name="threshold"
          min="0.05"
          max="0.15"
          value={rerankThreshold}
          step="0.01"
        />
        <div className={styles.sliderLabel}>
          <small>
            The lower the threshold, the more likely a result is to be included.
          </small>
        </div>
      </div>
    </div>
  )
}
