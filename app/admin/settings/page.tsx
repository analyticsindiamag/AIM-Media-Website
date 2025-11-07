'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/admin/image-upload'
import { defaultDesignSystem, parseDesignSystem, type DesignSystem } from '@/lib/design-system'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'colors' | 'typography' | 'spacing' | 'layout'>('general')
  const [form, setForm] = useState({
    siteName: '',
    logoUrl: '',
    navLinksJson: '',
    footerLinksJson: '',
    subscribeCta: '',
    headerBarLeftText: '',
    headerBarLeftLink: '',
    headerBarRightText: '',
    headerBarRightLink: '',
  })
  
  const [designSystem, setDesignSystem] = useState<DesignSystem>(defaultDesignSystem)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((s) => {
      setForm({
        siteName: s.siteName || '',
        logoUrl: s.logoUrl || '',
        navLinksJson: s.navLinksJson || '',
        footerLinksJson: s.footerLinksJson || '',
        subscribeCta: s.subscribeCta || '',
        headerBarLeftText: s.headerBarLeftText || '',
        headerBarLeftLink: s.headerBarLeftLink || '',
        headerBarRightText: s.headerBarRightText || '',
        headerBarRightLink: s.headerBarRightLink || '',
      })
      
      // Parse design system from database
      const ds = parseDesignSystem(
        s.designSystemColorsJson,
        s.designSystemTypographyJson,
        s.designSystemSpacingJson,
        s.designSystemLayoutJson
      )
      setDesignSystem(ds)
    })
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          designSystemColorsJson: JSON.stringify(designSystem.colors),
          designSystemTypographyJson: JSON.stringify(designSystem.typography),
          designSystemSpacingJson: JSON.stringify(designSystem.spacing),
          designSystemLayoutJson: JSON.stringify(designSystem.layout),
        }),
      })
      if (res.ok) {
        alert('Settings saved successfully!')
        // Refresh the page to show updated styles
        window.location.reload()
      } else {
        alert('Failed to save settings')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateDesignSystem = (section: keyof DesignSystem, field: string, value: string) => {
    setDesignSystem(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all design system settings to defaults?')) {
      setDesignSystem(defaultDesignSystem)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>Reset to Defaults</Button>
          <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save All Settings'}</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {(['general', 'colors', 'typography', 'spacing', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[var(--wsj-blue-primary)] text-[var(--wsj-blue-primary)]'
                  : 'border-transparent hover:border-[var(--wsj-border-light)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
          </div>
          <div>
            <Label>Logo</Label>
            <ImageUpload
              label="Upload Logo Image"
              value={form.logoUrl}
              onChange={(url) => setForm({ ...form, logoUrl: url })}
            />
            <div className="mt-2">
              <Label htmlFor="logoUrl">Or enter Logo URL manually</Label>
              <Input id="logoUrl" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label htmlFor="subscribeCta">Subscribe CTA Text</Label>
            <Input id="subscribeCta" value={form.subscribeCta} onChange={(e) => setForm({ ...form, subscribeCta: e.target.value })} placeholder="Get weekly AI insights..." />
          </div>
          <div>
            <Label htmlFor="navLinksJson">Nav Links JSON</Label>
            <Textarea id="navLinksJson" rows={4} value={form.navLinksJson} onChange={(e) => setForm({ ...form, navLinksJson: e.target.value })} placeholder='[{"label":"ENTERPRISE AI","href":"/category/enterprise-ai"}]' />
          </div>
          <div>
            <Label htmlFor="footerLinksJson">Footer Links JSON</Label>
            <Textarea id="footerLinksJson" rows={4} value={form.footerLinksJson} onChange={(e) => setForm({ ...form, footerLinksJson: e.target.value })} placeholder='[{"label":"Privacy","href":"/privacy"}]' />
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-xl font-bold mb-4">Header Bar Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="headerBarLeftText">Left Side Text</Label>
                <Input 
                  id="headerBarLeftText" 
                  value={form.headerBarLeftText} 
                  onChange={(e) => setForm({ ...form, headerBarLeftText: e.target.value })} 
                  placeholder="e.g., AI"
                />
              </div>
              <div>
                <Label htmlFor="headerBarLeftLink">Left Side Link URL (optional)</Label>
                <Input 
                  id="headerBarLeftLink" 
                  value={form.headerBarLeftLink} 
                  onChange={(e) => setForm({ ...form, headerBarLeftLink: e.target.value })} 
                  placeholder="e.g., /category/ai or https://..."
                />
              </div>
              <div>
                <Label htmlFor="headerBarRightText">Right Side Text</Label>
                <Input 
                  id="headerBarRightText" 
                  value={form.headerBarRightText} 
                  onChange={(e) => setForm({ ...form, headerBarRightText: e.target.value })} 
                  placeholder="e.g., AI TECH NEWS | Tech"
                />
              </div>
              <div>
                <Label htmlFor="headerBarRightLink">Right Side Link URL (optional)</Label>
                <Input 
                  id="headerBarRightLink" 
                  value={form.headerBarRightLink} 
                  onChange={(e) => setForm({ ...form, headerBarRightLink: e.target.value })} 
                  placeholder="e.g., / or https://..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colors Settings */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bgWhite">Background White</Label>
              <div className="flex gap-2">
                <Input 
                  id="bgWhite" 
                  type="color"
                  value={designSystem.colors.bgWhite} 
                  onChange={(e) => updateDesignSystem('colors', 'bgWhite', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.bgWhite} 
                  onChange={(e) => updateDesignSystem('colors', 'bgWhite', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgBlack">Background Black</Label>
              <div className="flex gap-2">
                <Input 
                  id="bgBlack" 
                  type="color"
                  value={designSystem.colors.bgBlack} 
                  onChange={(e) => updateDesignSystem('colors', 'bgBlack', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.bgBlack} 
                  onChange={(e) => updateDesignSystem('colors', 'bgBlack', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgDarkGray">Background Dark Gray</Label>
              <div className="flex gap-2">
                <Input 
                  id="bgDarkGray" 
                  type="color"
                  value={designSystem.colors.bgDarkGray} 
                  onChange={(e) => updateDesignSystem('colors', 'bgDarkGray', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.bgDarkGray} 
                  onChange={(e) => updateDesignSystem('colors', 'bgDarkGray', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgLightGray">Background Light Gray</Label>
              <div className="flex gap-2">
                <Input 
                  id="bgLightGray" 
                  type="color"
                  value={designSystem.colors.bgLightGray} 
                  onChange={(e) => updateDesignSystem('colors', 'bgLightGray', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.bgLightGray} 
                  onChange={(e) => updateDesignSystem('colors', 'bgLightGray', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textBlack">Text Black</Label>
              <div className="flex gap-2">
                <Input 
                  id="textBlack" 
                  type="color"
                  value={designSystem.colors.textBlack.startsWith('rgb') 
                    ? `#${designSystem.colors.textBlack.match(/\d+/g)?.map(v => parseInt(v).toString(16).padStart(2, '0')).join('') || '222222'}`
                    : designSystem.colors.textBlack} 
                  onChange={(e) => {
                    const hex = e.target.value
                    const rgb = hex.match(/[0-9a-f]{2}/gi)?.map(v => parseInt(v, 16)) || [34, 34, 34]
                    updateDesignSystem('colors', 'textBlack', `rgb(${rgb.join(', ')})`)
                  }}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.textBlack} 
                  onChange={(e) => updateDesignSystem('colors', 'textBlack', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textWhite">Text White</Label>
              <div className="flex gap-2">
                <Input 
                  id="textWhite" 
                  type="color"
                  value={designSystem.colors.textWhite} 
                  onChange={(e) => updateDesignSystem('colors', 'textWhite', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.textWhite} 
                  onChange={(e) => updateDesignSystem('colors', 'textWhite', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textDarkGray">Text Dark Gray</Label>
              <div className="flex gap-2">
                <Input 
                  id="textDarkGray" 
                  type="color"
                  value={designSystem.colors.textDarkGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textDarkGray', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.textDarkGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textDarkGray', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textMediumGray">Text Medium Gray</Label>
              <div className="flex gap-2">
                <Input 
                  id="textMediumGray" 
                  type="color"
                  value={designSystem.colors.textMediumGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textMediumGray', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.textMediumGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textMediumGray', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textLightGray">Text Light Gray</Label>
              <div className="flex gap-2">
                <Input 
                  id="textLightGray" 
                  type="color"
                  value={designSystem.colors.textLightGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textLightGray', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.textLightGray} 
                  onChange={(e) => updateDesignSystem('colors', 'textLightGray', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="borderLight">Border Light</Label>
              <div className="flex gap-2">
                <Input 
                  id="borderLight" 
                  type="color"
                  value={designSystem.colors.borderLight} 
                  onChange={(e) => updateDesignSystem('colors', 'borderLight', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.borderLight} 
                  onChange={(e) => updateDesignSystem('colors', 'borderLight', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="borderMedium">Border Medium</Label>
              <div className="flex gap-2">
                <Input 
                  id="borderMedium" 
                  type="color"
                  value={designSystem.colors.borderMedium} 
                  onChange={(e) => updateDesignSystem('colors', 'borderMedium', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.borderMedium} 
                  onChange={(e) => updateDesignSystem('colors', 'borderMedium', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="borderDark">Border Dark</Label>
              <div className="flex gap-2">
                <Input 
                  id="borderDark" 
                  type="color"
                  value={designSystem.colors.borderDark} 
                  onChange={(e) => updateDesignSystem('colors', 'borderDark', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.borderDark} 
                  onChange={(e) => updateDesignSystem('colors', 'borderDark', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bluePrimary">Blue Primary</Label>
              <div className="flex gap-2">
                <Input 
                  id="bluePrimary" 
                  type="color"
                  value={designSystem.colors.bluePrimary} 
                  onChange={(e) => updateDesignSystem('colors', 'bluePrimary', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.bluePrimary} 
                  onChange={(e) => updateDesignSystem('colors', 'bluePrimary', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="blueHover">Blue Hover</Label>
              <div className="flex gap-2">
                <Input 
                  id="blueHover" 
                  type="color"
                  value={designSystem.colors.blueHover} 
                  onChange={(e) => updateDesignSystem('colors', 'blueHover', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.blueHover} 
                  onChange={(e) => updateDesignSystem('colors', 'blueHover', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="redNegative">Red Negative</Label>
              <div className="flex gap-2">
                <Input 
                  id="redNegative" 
                  type="color"
                  value={designSystem.colors.redNegative} 
                  onChange={(e) => updateDesignSystem('colors', 'redNegative', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.redNegative} 
                  onChange={(e) => updateDesignSystem('colors', 'redNegative', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="greenPositive">Green Positive</Label>
              <div className="flex gap-2">
                <Input 
                  id="greenPositive" 
                  type="color"
                  value={designSystem.colors.greenPositive} 
                  onChange={(e) => updateDesignSystem('colors', 'greenPositive', e.target.value)}
                  className="w-20 h-10"
                />
                <Input 
                  value={designSystem.colors.greenPositive} 
                  onChange={(e) => updateDesignSystem('colors', 'greenPositive', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typography Settings */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fontSerif">Serif Font Family</Label>
              <Input 
                id="fontSerif" 
                value={designSystem.typography.fontSerif} 
                onChange={(e) => updateDesignSystem('typography', 'fontSerif', e.target.value)}
                placeholder="'Times New Roman', Georgia, 'Times', serif"
              />
            </div>
            <div>
              <Label htmlFor="fontSans">Sans-serif Font Family</Label>
              <Input 
                id="fontSans" 
                value={designSystem.typography.fontSans} 
                onChange={(e) => updateDesignSystem('typography', 'fontSans', e.target.value)}
                placeholder="Helvetica, Arial, sans-serif"
              />
            </div>
            {(['fontSizeTicker', 'fontSizeXs', 'fontSizeSm', 'fontSizeBase', 'fontSizeMd', 'fontSizeLg', 'fontSizeXl', 'fontSize2xl', 'fontSize3xl', 'fontSize4xl', 'fontSize5xl', 'fontSize6xl', 'fontSize7xl'] as const).map((size) => (
              <div key={size}>
                <Label htmlFor={size}>{size.replace('fontSize', 'Font Size ').replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input 
                  id={size} 
                  value={designSystem.typography[size]} 
                  onChange={(e) => updateDesignSystem('typography', size, e.target.value)}
                />
              </div>
            ))}
            {(['fontWeightLight', 'fontWeightNormal', 'fontWeightMedium', 'fontWeightSemibold', 'fontWeightBold'] as const).map((weight) => (
              <div key={weight}>
                <Label htmlFor={weight}>{weight.replace('fontWeight', 'Font Weight ').replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input 
                  id={weight} 
                  type="number"
                  value={designSystem.typography[weight]} 
                  onChange={(e) => updateDesignSystem('typography', weight, e.target.value)}
                />
              </div>
            ))}
            {(['lineHeightTight', 'lineHeightNormal', 'lineHeightRelaxed', 'lineHeightLoose', 'lineHeightArticle'] as const).map((lh) => (
              <div key={lh}>
                <Label htmlFor={lh}>{lh.replace('lineHeight', 'Line Height ').replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input 
                  id={lh} 
                  type="number"
                  step="0.01"
                  value={designSystem.typography[lh]} 
                  onChange={(e) => updateDesignSystem('typography', lh, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing Settings */}
      {activeTab === 'spacing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['spacingXs', 'spacingSm', 'spacingMd', 'spacingLg', 'spacingXl', 'spacing2xl', 'spacing3xl'] as const).map((spacing) => (
              <div key={spacing}>
                <Label htmlFor={spacing}>{spacing.replace('spacing', 'Spacing ').replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input 
                  id={spacing} 
                  value={designSystem.spacing[spacing]} 
                  onChange={(e) => updateDesignSystem('spacing', spacing, e.target.value)}
                  placeholder="e.g., 1rem, 16px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Settings */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="containerMaxWidth">Container Max Width</Label>
              <Input 
                id="containerMaxWidth" 
                value={designSystem.layout.containerMaxWidth} 
                onChange={(e) => updateDesignSystem('layout', 'containerMaxWidth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="containerPaddingX">Container Padding X</Label>
              <Input 
                id="containerPaddingX" 
                value={designSystem.layout.containerPaddingX} 
                onChange={(e) => updateDesignSystem('layout', 'containerPaddingX', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="containerPaddingXMd">Container Padding X (Medium)</Label>
              <Input 
                id="containerPaddingXMd" 
                value={designSystem.layout.containerPaddingXMd} 
                onChange={(e) => updateDesignSystem('layout', 'containerPaddingXMd', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="articleMaxWidth">Article Max Width</Label>
              <Input 
                id="articleMaxWidth" 
                value={designSystem.layout.articleMaxWidth} 
                onChange={(e) => updateDesignSystem('layout', 'articleMaxWidth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headerTopHeight">Header Top Height</Label>
              <Input 
                id="headerTopHeight" 
                value={designSystem.layout.headerTopHeight} 
                onChange={(e) => updateDesignSystem('layout', 'headerTopHeight', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headerLogoSize">Header Logo Size</Label>
              <Input 
                id="headerLogoSize" 
                value={designSystem.layout.headerLogoSize} 
                onChange={(e) => updateDesignSystem('layout', 'headerLogoSize', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headerNavHeight">Header Nav Height</Label>
              <Input 
                id="headerNavHeight" 
                value={designSystem.layout.headerNavHeight} 
                onChange={(e) => updateDesignSystem('layout', 'headerNavHeight', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonBorderRadius">Button Border Radius</Label>
              <Input 
                id="buttonBorderRadius" 
                value={designSystem.layout.buttonBorderRadius} 
                onChange={(e) => updateDesignSystem('layout', 'buttonBorderRadius', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonPaddingX">Button Padding X</Label>
              <Input 
                id="buttonPaddingX" 
                value={designSystem.layout.buttonPaddingX} 
                onChange={(e) => updateDesignSystem('layout', 'buttonPaddingX', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="buttonPaddingY">Button Padding Y</Label>
              <Input 
                id="buttonPaddingY" 
                value={designSystem.layout.buttonPaddingY} 
                onChange={(e) => updateDesignSystem('layout', 'buttonPaddingY', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="borderWidth">Border Width</Label>
              <Input 
                id="borderWidth" 
                value={designSystem.layout.borderWidth} 
                onChange={(e) => updateDesignSystem('layout', 'borderWidth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Input 
                id="borderRadius" 
                value={designSystem.layout.borderRadius} 
                onChange={(e) => updateDesignSystem('layout', 'borderRadius', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transitionFast">Transition Fast</Label>
              <Input 
                id="transitionFast" 
                value={designSystem.layout.transitionFast} 
                onChange={(e) => updateDesignSystem('layout', 'transitionFast', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transitionBase">Transition Base</Label>
              <Input 
                id="transitionBase" 
                value={designSystem.layout.transitionBase} 
                onChange={(e) => updateDesignSystem('layout', 'transitionBase', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transitionSlow">Transition Slow</Label>
              <Input 
                id="transitionSlow" 
                value={designSystem.layout.transitionSlow} 
                onChange={(e) => updateDesignSystem('layout', 'transitionSlow', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t mt-8">
        <Button onClick={save} disabled={loading} className="w-full md:w-auto">
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
