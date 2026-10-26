# Bifimoto Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Code reviewed and approved
- [ ] Dependencies updated to latest stable versions

### Security
- [ ] Environment variables secured (not in git)
- [ ] RLS policies enabled on all Supabase tables
- [ ] Apply and verify every migration, including trade-order review hardening
- [ ] Verify non-admins cannot access admin pages or review endpoints
- [ ] Verify users can read only their own orders and cannot edit/delete orders
- [ ] Verify admin decisions are audited and only pending orders can be reviewed once
- [ ] Keep service-role keys out of browser and web-app environment variables
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] File upload validation active
- [ ] HTTPS enforced in production
- [ ] Security headers configured

### Database
- [ ] All migrations applied
- [ ] Seed data inserted
- [ ] Indexes created
- [ ] RLS policies tested
- [ ] Backup strategy configured

### Email
- [ ] Email service configured (Resend)
- [ ] Email templates tested
- [ ] Verification emails working
- [ ] Email domain verified

---

## Deployment Steps

### 1. Supabase Setup
- [ ] Create production Supabase project
- [ ] Run database migrations
- [ ] Configure authentication settings
- [ ] Set up email templates
- [ ] Configure RLS policies
- [ ] Test database connections

### 2. Vercel Setup
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Configure DNS records
- [ ] Enable Vercel Analytics

### 3. Environment Variables
\`\`\`bash
# Verify all required variables are set:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
\`\`\`

The service-role key is not used by the web app and must not be exposed to the browser. Email confirmation is handled by Supabase Auth. See [Supabase Setup](SUPABASE_SETUP.md) for project configuration.

### 4. Deploy
- [ ] Push to main branch
- [ ] Monitor build logs
- [ ] Verify deployment successful
- [ ] Check production URL loads

---

## Post-Deployment

### Testing
- [ ] Sign-up flow works
- [ ] Email verification works
- [ ] Sign-in works
- [ ] Dashboard loads
- [ ] Transactions can be created
- [ ] Admin panel accessible
- [ ] Exchange rates display correctly
- [ ] Mobile responsive

### Monitoring
- [ ] Vercel Analytics active
- [ ] Supabase monitoring configured
- [ ] Error tracking set up
- [ ] Performance metrics baseline established

### Documentation
- [ ] API documentation updated
- [ ] README updated with production URL
- [ ] Team notified of deployment
- [ ] Changelog updated

---

## Rollback Plan

If issues occur:
1. Revert to previous Vercel deployment
2. Check error logs in Vercel Dashboard
3. Verify Supabase connection
4. Check environment variables
5. Test in staging environment
6. Fix issues and redeploy

---

## Success Criteria

- [ ] All critical user flows working
- [ ] No console errors
- [ ] Page load time < 3 seconds
- [ ] Mobile experience smooth
- [ ] Email delivery working
- [ ] Admin panel functional
- [ ] Zero downtime during deployment
