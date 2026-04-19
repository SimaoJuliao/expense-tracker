import { Sun, Moon, User, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSettingsPage } from './SettingsPage.helper';

export const SettingsPage = () => {
  const { user, t, locale, setLocale, theme, setTheme } = useSettingsPage();

  return (
    <div className="max-w-xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('settings.subtitle')}</p>
      </header>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold">{t('settings.accountSection')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex items-center gap-2">
                <dt className="text-xs text-muted-foreground w-16 shrink-0">{t('settings.emailLabel')}</dt>
                <Separator orientation="vertical" className="h-4" />
                <dd className="text-sm font-medium truncate">{user?.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {theme === 'dark'
                ? <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                : <Sun  className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              <CardTitle className="text-sm font-semibold">{t('settings.themeSection')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('settings.themeLabel')}</Label>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-150',
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="h-4 w-4" aria-hidden="true" />
                  {t('settings.lightMode')}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-150',
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="h-4 w-4" aria-hidden="true" />
                  {t('settings.darkMode')}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-semibold">{t('settings.languageSection')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="language-select" className="text-xs text-muted-foreground">
                {t('settings.languageLabel')}
              </Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger id="language-select" className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.english')}</SelectItem>
                  <SelectItem value="pt">{t('settings.portuguese')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
