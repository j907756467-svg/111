// Shared empty-state shown by per-trip views when no trip is selected.

export function noTripState(container, ctx) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🧭</div>
      <p class="empty-title">请先选择一段行程</p>
      <p class="empty-text">日程、费用和行李清单都属于具体的某次出差。</p>
      <button type="button" class="btn btn-primary" id="go-trips">前往行程管理</button>
    </div>
  `;
  container.querySelector('#go-trips').addEventListener('click', () => ctx.navigate('trips'));
}
