// Where Pax Silica stands on the public record: what is on paper (filled marker) and what is missing (hollow).
import ChartFigure from './ChartFrame';

const ROWS: { on: boolean; status: string; what: string; note?: string }[] = [
  { on: true, status: 'Signed', what: 'Pax Silica declaration', note: 'April 16. Non-binding.' },
  { on: true, status: 'Offered', what: 'About 1,619 hectares, rent-free for two years', note: 'BCDA letter, April 9. Later rent to be agreed.' },
  { on: false, status: 'Not signed', what: 'Framework agreement with the actual obligations' },
  { on: false, status: 'Withheld', what: 'Official site boundaries', note: 'Exact parcel data withheld September 1' },
  { on: false, status: 'Not published', what: 'Cost-benefit analysis for the hub' },
  { on: false, status: 'Not filed', what: 'Environmental impact assessment', note: 'None applied for as of August 26' },
  { on: false, status: 'Not specified', what: 'Technology-transfer terms' },
  { on: false, status: 'Not secured', what: 'Consent of the affected Aeta community', note: 'Per Human Rights Watch, November 16' },
];

export default function StatusChart() {
  return (
    <ChartFigure title="Where Pax Silica stands" sub="Public record as of November 18, 2026">
      <table className="v3ch-status">
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.status}>
              <td className="v3ch-s"><span className={row.on ? 'v3ch-mk v3ch-mk-on' : 'v3ch-mk v3ch-mk-off'} aria-hidden="true" />{row.status}</td>
              <td className="v3ch-w">{row.what}{row.note && <span className="v3ch-d">{row.note}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartFigure>
  );
}
