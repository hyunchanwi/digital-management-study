export type DeploymentChecks = {
  localBuildPassed: boolean;
  desktopChecked: boolean;
  mobileChecked: boolean;
  publicUrl?: string;
};

export function canMarkCourseLive(checks: DeploymentChecks) {
  return checks.localBuildPassed
    && checks.desktopChecked
    && checks.mobileChecked
    && Boolean(checks.publicUrl?.startsWith('https://'));
}
